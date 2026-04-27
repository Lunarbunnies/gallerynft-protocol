import { expect } from "chai";
import { network } from "hardhat";

describe("GalleryNFT", function () {
  let ethers;

  before(async function () {
    ({ ethers } = await network.getOrCreate());
  });

  async function deployFixture() {
    const Factory = await ethers.getContractFactory("GalleryNFT");
    const contract = await Factory.deploy("GalleryNFT", "GLRY");
    await contract.waitForDeployment();

    const [owner, other] = await ethers.getSigners();
    return { contract, owner, other };
  }

  it("mints one ERC-721 per gallery and stores fields", async function () {
    const { contract, owner } = await deployFixture();

    const tx = await contract.createGallery("Genesis", "First curated set");
    await tx.wait();

    expect(await contract.ownerOf(1n)).to.equal(owner.address);

    const gallery = await contract.getGallery(1n);
    expect(gallery[0]).to.equal("Genesis");
    expect(gallery[1]).to.equal("First curated set");
    expect(gallery[4]).to.equal(owner.address);
  });

  it("supports item lifecycle and read helpers", async function () {
    const { contract } = await deployFixture();
    await (await contract.createGallery("Genesis", "First curated set")).wait();

    const packedRef = "0x0000000000000001000000000000000000000000000000000000000000000000000000000000000001";
    const itemKey = ethers.keccak256(packedRef);

    await (await contract.addItem(1n, packedRef, 7, "Punk", "Blue background")).wait();

    const item = await contract.getItem(1n, itemKey);
    expect(item.packedRef).to.equal(packedRef);
    expect(item.displayOrder).to.equal(7);
    expect(item.label).to.equal("Punk");

    const keys = await contract.getGalleryItems(1n);
    expect(keys.length).to.equal(1);
    expect(keys[0]).to.equal(itemKey);

    await (await contract.updateItemFields(1n, itemKey, 9, "Punk Updated", "Edited note")).wait();

    const fields = await contract.getItemFields(1n, itemKey);
    expect(fields[0]).to.equal(9);
    expect(fields[1]).to.equal("Punk Updated");
    expect(fields[2]).to.equal("Edited note");

    await (await contract.removeItem(1n, itemKey)).wait();

    const status = await contract.getItemStatus(1n, itemKey);
    expect(status[2]).to.equal(false);

    const activeKeys = await contract.getGalleryItems(1n);
    expect(activeKeys.length).to.equal(0);
  });

  it("enforces owner/approved control", async function () {
    const { contract, other } = await deployFixture();
    await (await contract.createGallery("Genesis", "First curated set")).wait();

    await expect(
      contract.connect(other).setGalleryFields(1n, "Hacked", "Nope")
    ).to.be.revertedWithCustomError(contract, "NotGalleryController");
  });
});
