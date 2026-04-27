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

    const tx = contract.createGallery("Genesis", "First curated set");
    await expect(tx)
      .to.emit(contract, "GalleryCreated")
      .withArgs(1n, owner.address);

    await expect(tx)
      .to.emit(contract, "GalleryFieldsUpdated")
      .withArgs(1n, "Genesis", "First curated set");

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

    await expect(contract.addItem(1n, packedRef, 7, "Punk", "Blue background"))
      .to.emit(contract, "ItemAdded")
      .withArgs(1n, itemKey, packedRef);

    await expect(contract.addItem(1n, packedRef, 7, "Punk", "Blue background")).to.be.revertedWithCustomError(
      contract,
      "ItemAlreadyActive"
    );

    const item = await contract.getItem(1n, itemKey);
    expect(item.packedRef).to.equal(packedRef);
    expect(item.displayOrder).to.equal(7);
    expect(item.label).to.equal("Punk");

    const keys = await contract.getGalleryItems(1n);
    expect(keys.length).to.equal(1);
    expect(keys[0]).to.equal(itemKey);

    await expect(contract.updateItemFields(1n, itemKey, 9, "Punk Updated", "Edited note"))
      .to.emit(contract, "ItemFieldsUpdated")
      .withArgs(1n, itemKey, 9, "Punk Updated", "Edited note");

    const fields = await contract.getItemFields(1n, itemKey);
    expect(fields[0]).to.equal(9);
    expect(fields[1]).to.equal("Punk Updated");
    expect(fields[2]).to.equal("Edited note");

    await expect(contract.removeItem(1n, itemKey))
      .to.emit(contract, "ItemRemoved")
      .withArgs(1n, itemKey);

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

  it("reverts duplicate add while active, but allows re-add after remove", async function () {
    const { contract } = await deployFixture();
    await (await contract.createGallery("Genesis", "First curated set")).wait();

    const packedRef =
      "0x0000000000000001000000000000000000000000000000000000000000000000000000000000000001";
    const itemKey = ethers.keccak256(packedRef);

    await (await contract.addItem(1n, packedRef, 1, "First", "First note")).wait();

    await expect(
      contract.addItem(1n, packedRef, 2, "Second", "Second note")
    ).to.be.revertedWithCustomError(contract, "ItemAlreadyActive");

    await (await contract.removeItem(1n, itemKey)).wait();
    await (await contract.addItem(1n, packedRef, 2, "Second", "Second note")).wait();

    const status = await contract.getItemStatus(1n, itemKey);
    expect(status[2]).to.equal(true);

    const fields = await contract.getItemFields(1n, itemKey);
    expect(fields[0]).to.equal(2);
    expect(fields[1]).to.equal("Second");
    expect(fields[2]).to.equal("Second note");
  });

  it("reverts update and remove for already-removed items", async function () {
    const { contract } = await deployFixture();
    await (await contract.createGallery("Genesis", "First curated set")).wait();

    const packedRef =
      "0x0000000000000001000000000000000000000000000000000000000000000000000000000000000001";
    const itemKey = ethers.keccak256(packedRef);

    await (await contract.addItem(1n, packedRef, 1, "First", "First note")).wait();
    await (await contract.removeItem(1n, itemKey)).wait();

    await expect(
      contract.updateItemFields(1n, itemKey, 3, "Updated", "Updated")
    ).to.be.revertedWithCustomError(contract, "ItemAlreadyRemoved");

    await expect(contract.removeItem(1n, itemKey)).to.be.revertedWithCustomError(
      contract,
      "ItemAlreadyRemoved"
    );
  });

  it("supports approved operator writes", async function () {
    const { contract, other } = await deployFixture();
    await (await contract.createGallery("Genesis", "First curated set")).wait();
    await (await contract.setApprovalForAll(other.address, true)).wait();

    const tx = await contract
      .connect(other)
      .setGalleryFields(1n, "Edited by operator", "Approved path");
    await tx.wait();

    const gallery = await contract.getGallery(1n);
    expect(gallery[0]).to.equal("Edited by operator");
    expect(gallery[1]).to.equal("Approved path");
  });

  it("orders active items by effective order (displayOrder else addedAt)", async function () {
    const { contract } = await deployFixture();
    await (await contract.createGallery("Genesis", "First curated set")).wait();

    const packedRefA =
      "0x0000000000000001000000000000000000000000000000000000000000000000000000000000000001";
    const packedRefB =
      "0x0000000000000001000000000000000000000000000000000000000000000000000000000000000002";
    const packedRefC =
      "0x0000000000000001000000000000000000000000000000000000000000000000000000000000000003";
    const keyA = ethers.keccak256(packedRefA);
    const keyB = ethers.keccak256(packedRefB);
    const keyC = ethers.keccak256(packedRefC);

    await (await contract.addItem(1n, packedRefA, 0, "A", "A")).wait();
    await (await contract.addItem(1n, packedRefB, 5, "B", "B")).wait();
    await (await contract.addItem(1n, packedRefC, 2, "C", "C")).wait();

    const ordered = await contract.getGalleryItems(1n);
    expect(ordered).to.deep.equal([keyC, keyB, keyA]);
  });
});
