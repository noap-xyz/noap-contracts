import { expect, use } from 'chai';
import { Contract, utils } from 'ethers';
import {
    deployContract,
    MockProvider,
    solidity
} from 'ethereum-waffle';

import NOAP from '../build/NOAP.json';
import Test721 from '../build/Test721.json';

use(solidity);

describe('NOAP', () => {
    const tokenURIReminted = 'https://example.com/foo.json';
    const tokenURINewEvent = 'https://example.com/bar.json';
    const [
        deployer,
        minterA,
        minterB,
        minterC,
        recipientA,
        recipientB,
        recipientC,
        ...accounts
    ] = new MockProvider().getWallets();

    let NOAPContract, testContract;

    it('deploys the NOAP contract a generic 721 Contract', async () => {
        NOAPContract = await deployContract(deployer, NOAP, [])
        testContract = await deployContract(deployer, Test721, []);
    });

    it('mints an NFT on the test contract', async () => {
        await testContract.connect(minterA).mint(1, recipientA.address, tokenURIReminted);
        const tokenURIResult = await testContract.tokenURI(1);
        expect(tokenURIResult).to.equal(tokenURIReminted);
    });

    it('burns and remints an NFT on the NOAP contract', async () => {
        await testContract.connect(recipientA).approve(NOAPContract.address, 1);
        await NOAPContract.connect(recipientA).burnAndRemint(testContract.address, 1);
        const tokenID = await NOAPContract.getLastTokenID();
        const tokenURIResult = await NOAPContract.tokenURI(tokenID);
        expect(tokenURIResult).to.equal(tokenURIReminted);
    });

    it('fails to remint twice', async () => {
        await expect(NOAPContract.connect(recipientA).burnAndRemint(testContract.address, 1)).to.be.reverted;
    });

    it('creates an event', async () => {
        await NOAPContract.connect(minterA).createEvent(tokenURINewEvent);
    });

    it('allows minter to issue NOAPs', async () => {
        const eventID = await NOAPContract.getLastEventID();
        await NOAPContract.connect(minterA).mint(eventID, recipientA.address);
        const tokenID = await NOAPContract.getLastTokenID();
        const tokenURIResult = await NOAPContract.tokenURI(tokenID);
        expect(tokenURIResult).to.equal(tokenURINewEvent);
        const tokenOwner = await NOAPContract.ownerOf(tokenID);
        expect(tokenOwner).to.equal(recipientA.address);
    });

    it('allows minter to authorize other minters', async () => {
        const eventID = await NOAPContract.getLastEventID();
        await NOAPContract.connect(minterA).addEventMinter(eventID, minterB.address);
        await NOAPContract.connect(minterB).mint(eventID, recipientB.address);
        const tokenID = await NOAPContract.getLastTokenID();
        const tokenURIResult = await NOAPContract.tokenURI(tokenID);
        expect(tokenURIResult).to.equal(tokenURINewEvent);
        const tokenOwner = await NOAPContract.ownerOf(tokenID);
        expect(tokenOwner).to.equal(recipientB.address);
    });

    it('prevents unauthorized minters from minting', async () => {
        const eventID = await NOAPContract.getLastEventID();
        await expect(NOAPContract.connect(minterC).mint(eventID, recipientC.address)).to.be.reverted;
    });

    it('allows minter to renounce privileges', async () => {
        const eventID = await NOAPContract.getLastEventID();
        await NOAPContract.connect(minterB).renounceEventMinter(eventID);
        await expect(NOAPContract.connect(minterB).mint(eventID, recipientB.address)).to.be.reverted;
    });

    it('ends an event', async () => {
        const eventID = await NOAPContract.getLastEventID();
        await NOAPContract.connect(minterA).endEvent(eventID);
        await expect(NOAPContract.connect(minterA).mint(eventID, recipientA.address)).to.be.reverted;
    });
});
