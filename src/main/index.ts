import { app, dialog, Menu, shell, Tray } from "electron";
import prompt from "electron-prompt";
import started from "electron-squirrel-startup";
import { spawn } from "node:child_process";
import {
    collectionItemSchema,
    collectionSchema,
    collectionsController,
} from "../Store/Collections";

import path from "node:path";

// const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (started) {
    app.quit();
}

let tray: Tray | null = null;

app.on("window-all-closed", () => {});

function buildTrayMenu(updateTray: () => void) {
    const collections = collectionsController.getCollections();

    console.log(collections);

    const collectionMenus = collections.map((collection) => ({
        label: collection.name,
        submenu: [
            ...collection.itens.map((item: { name: any; path: string }) => ({
                label: item.name,
                submenu: [
                    {
                        label: "Code",
                        click() {
                            spawn("code", [item.path]);
                        },
                    },
                    {
                        label: "Gerenciador",
                        click: () => {
                            shell.openPath(item.path);
                        },
                    },
                ],
            })),
            {
                label: "Adicionar Item",
                click() {
                    dialog
                        .showOpenDialog({
                            properties: ["openDirectory"],
                            title: "Selecione a pasta de um projeto",
                        })
                        .then(async (res) => {
                            if (!res.canceled) {
                                console.log(res);

                                const name = await prompt({
                                    title: "Informe o nome do item",
                                    label: "Nome:",
                                });

                                if (name) {
                                    const collectionItem =
                                        collectionItemSchema.parse({
                                            path: res.filePaths[0],
                                            name,
                                        });

                                    collectionsController.addItem(
                                        collection.id,
                                        collectionItem
                                    );

                                    updateTray();
                                }
                            }
                        });
                },
            },
        ],
    }));

    return Menu.buildFromTemplate([
        ...collectionMenus,
        { type: "separator" },
        {
            label: "Adicionar Coleção",
            click: async () => {
                // const { response, checkboxChecked } =
                //     await dialog.showMessageBox({
                //         type: "question",
                //         buttons: ["OK"],
                //         title: "Adicionar Collection",
                //         message: "Funcionalidade de adicionar collection aqui.",
                //     });
                const name = await prompt({
                    title: "Informe o nome da Coleção",
                    label: "Nome:",
                });

                if (name) {
                    collectionsController.addCollection(
                        collectionSchema.parse({
                            name,
                        })
                    );

                    updateTray();
                }
            },
        },
        { type: "separator" },
        { role: "quit", label: "Sair" },
    ]);
}

app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, "../../", "icon.png"));
    tray.setToolTip("VSCode Tray");

    const setMenu = () => {
        tray!.setContextMenu(buildTrayMenu(setMenu));
    };

    setMenu();
});
