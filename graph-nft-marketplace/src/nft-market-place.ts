import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import {
    ItemBought as ItemBoughtEvent,
    ItemCanceled as ItemCanceledEvent,
    ItemListed as ItemListedEvent,
} from "../generated/NftMarketPlace/NftMarketPlace";
import {
    ItemListed,
    ActiveItem,
    ItemBought,
    ItemCanceled,
} from "../generated/schema";

export function handleItemBought(event: ItemBoughtEvent): void {
    let itemBought = ItemBought.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
    let activeItem = ActiveItem.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
    if (!itemBought) {
        itemBought = new ItemBought(
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        );
    }
    itemBought.buyer = event.params.sender;
    itemBought.nftAddress = event.params.nftAddress;
    itemBought.tokenId = event.params.tokenId;
    activeItem!.buyer = event.params.sender;

    itemBought.save();
    activeItem!.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
    let itemCancelled = ItemCanceled.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
    let activeItem = ActiveItem.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
    let itemListed = ItemListed.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
    if (!itemCancelled) {
        itemCancelled = new ItemCanceled(
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        );
    }

    itemCancelled.seller = event.params.seller;
    itemCancelled.nftAddress = event.params.nftAddress;
    itemCancelled.tokenId = event.params.tokenId;

    if (activeItem) {
        store.remove(
            "ActiveItem",
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        );
    }

    if(itemListed) {
        store.remove(
            "ItemListed",
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        )
    }

    itemCancelled.save();
}

export function handleItemListed(event: ItemListedEvent): void {
    let itemListed = ItemListed.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
    let activeItem = ActiveItem.load(
        getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
    if (!itemListed) {
        itemListed = new ItemListed(
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        );
    }
    if (!activeItem) {
        activeItem = new ActiveItem(
            getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
        );
    }
    itemListed.seller = event.params.seller;
    activeItem.seller = event.params.seller;

    itemListed.nftAddress = event.params.nftAddress;
    activeItem.nftAddress = event.params.nftAddress;

    itemListed.tokenId = event.params.tokenId;
    activeItem.tokenId = event.params.tokenId;

    itemListed.price = event.params.price;
    activeItem.price = event.params.price;

    activeItem.buyer = Address.fromString(
        "0x000000000000000000000000000000000000dEaD"
    );

    itemListed.save();
    activeItem.save();
}

function getIdFromEventParams(tokenID: BigInt, nftAddress: Address): string {
    return tokenID.toHexString() + nftAddress.toHexString();
}
