import { randomUUID } from "node:crypto";
import { z } from "zod";
import ElectronStore from "zod-electron-store";

export const collectionItemSchema = z.object({
    id: z.uuidv4().default(() => randomUUID()),
    name: z
        .string()
        .min(3, "O nome da coleção precisa ter no mínimo 3 caracteres"),
    path: z.string(),
});

export const collectionSchema = z.object({
    id: z.uuidv4().default(() => randomUUID()),
    name: z
        .string()
        .min(3, "O nome da coleção precisa ter no mínimo 3 caracteres"),
    itens: z.array(collectionItemSchema).default([]),
});

export type Collection = z.infer<typeof collectionSchema>;
export type CollectionItem = z.infer<typeof collectionItemSchema>;

export const CollectionStore = new ElectronStore<{ collections: Collection[] }>(
    {
        schema: z.object({
            collections: z.array(collectionSchema).default([]),
        }),
        name: "collections",
    }
);

class CollectionsController {
    getCollections() {
        return CollectionStore.get("collections");
    }

    addCollection(data: Collection) {
        const collections = this.getCollections();

        collections.push(data);

        CollectionStore.set("collections", collections);
    }

    addItem(id: string, item: CollectionItem) {
        const collections = this.getCollections();
        const index = collections.findIndex((c) => c.id === id);

        collections[index].itens.push(item);

        CollectionStore.set("collections", collections);
    }

    removeItem(collectionId: string, itemId: string) {
        const collections = this.getCollections();
        const index = collections.findIndex((c) => c.id === collectionId);

        collections[index].itens = collections[index].itens.filter(
            (i) => i.id !== itemId
        );

        CollectionStore.set("collections", collections);
    }
}

export const collectionsController = new CollectionsController();
