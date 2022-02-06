# NOAP

The **No**tarized **A**ttendance **P**rotocol (and corresponding assets, NOAPs), are a way for event coordinators to notarize participation and issue digital receipts to event attendees

## NOAP: Primary issuance mechanism

In order to issue NOAPs, one must first create an event. **Anyone can create an event.** In order to create an event, one needs the URL to the asset metadata (an NFT JSON file) which is submitted in the contract call to create the event. A given metadata URL can only be used for one event, however a single event can generate many NOAPs.

By default, the event creator has the `minter` privilege, allowing them to issue NOAPs to participants. A minter can add other minters, renounce their minting functionality, and change the royalty recipient in the event NOAPs are sold on a secondary market. The royalty percentage is hardcoded to 10%, and the default recipient is the

Anyone with `minter` capabilities can mint NOAPs to any address, without limitation. If an event minter calls `endEvent`, minting will halt and no new NOAPs can be issued for a given event.

## Bonus: Reminting other assets as NOAPs

Existing assets on other protocols can be burned-and-reminted through the NOAP contract, which will copy the asset metadata into the reminted NOAP. To perform this action, the asset owner must first `approve` the NOAP contract to transfer the asset on their behalf. In a subsequent call to `burnAndRemint`, the NOAP contract will burn the source asset and remint it on the NOAP contract.

## License

MIT