
const { dialog } = nodeRequire("electron").remote
const { ipcRenderer } = nodeRequire("electron")
const path = nodeRequire("path")
const { copyFile } = nodeRequire("fs")
const copydir = nodeRequire("copy-dir")

const DataStore = nodeRequire('./../utils/DataStore.js');
let blueStore = new DataStore({
    name: "watch-and-copy"
})

let currentFile

// 开启 添加文件 模态框
function showAddFileModal() {
    $("#addFile").modal("show")
}

// 选择源文件
function selectSourceFile() {
    dialog.showOpenDialog({
        title: "选择源文件",
        properties: ["openFile"]
    }, (filePaths) => {
        if (filePaths.length > 0) {
            document.getElementById("sourceFilePath").value = filePaths[0]
        }
    })
}

// 选择目标文件
function selectTargetFile() {
    if (document.getElementById("sourceFilePath").value.length == 0) {
        alert("请先选择源文件")
        return
    }
    dialog.showOpenDialog({
        title: "选择目标文件",
        properties: ["openDirectory"]
    }, (filePaths) => {
        if (filePaths.length > 0) {
            let targetFilePath = path.join(filePaths[0], path.basename(document.getElementById("sourceFilePath").value))
            document.getElementById("targetFilePath").value = targetFilePath
            document.getElementById("renameTargetFile").value = path.basename(document.getElementById("sourceFilePath").value)
        }
    })
}

// 重命名目标文件
function renameTargetFile() {
    let targetFileNewName = document.getElementById("renameTargetFile").value
    document.getElementById("targetFilePath").value = path.join(path.dirname(document.getElementById("targetFilePath").value), targetFileNewName)
}

// 渲染
function renderHTML() {
    if (blueStore.getData().length == 0) {
        document.getElementById("source-content").innerHTML = `<li class="list-group-item">Nothing...</li>`
        document.getElementById("target-content").innerHTML = `<li class="list-group-item">Nothing...</li>`
        return
    }
    let sourceList = blueStore.getData().map((item) => {
        return {
            id: item.id,
            type: item.type,
            source: item.source
        }
    })
    let targetList = blueStore.getData().map((item) => {
        return {
            id: item.id,
            type: item.type,
            target: item.target
        }
    })
    document.getElementById("source-content").innerHTML = sourceList.reduce((html, item) => {
        if (item.type === "file") {
            return html = html + `<li class="list-group-item list-nowrap" title="${item.source}"><i class="fa fa-file-text mr-2" aria-hidden="true"></i>${item.source}</li>`
        } else {
            return html = html + `<li class="list-group-item list-nowrap" title="${item.source}"><i class="fa fa-folder mr-2" aria-hidden="true"></i>${item.source}</li>`
        }
    }, "")
    document.getElementById("target-content").innerHTML = targetList.reduce((html, item) => {
        if (item.type === "file") {
            return html = html + `<li class="list-group-item list-nowrap" title="${item.target}"><i class="fa fa-file-text mr-2" aria-hidden="true"></i>${item.target}</li>`
        } else {
            return html = html + `<li class="list-group-item list-nowrap" title="${item.target}"><i class="fa fa-folder mr-2" aria-hidden="true"></i>${item.target}</li>`
        }
    }, "")
}

// 确认添加文件
function confirmAddFile() {
    let sourceFilePath = document.getElementById("sourceFilePath").value
    let targetFilePath = document.getElementById("targetFilePath").value
    if (sourceFilePath.length == 0 || (targetFilePath.length == 0)) {
        alert("源文件或目标文件为空")
        return
    }
    $("#addFile").modal("hide")
    blueStore.saveData(sourceFilePath, targetFilePath, "file")
    renderHTML()
    document.getElementById("sourceFilePath").value = ""
    document.getElementById("targetFilePath").value = ""
    document.getElementById("renameTargetFile").value = ""
}

// 首次启动
ipcRenderer.on("first-start", () => {
    renderHTML()
})

// 开启 添加文件夹 模态框
function showAddDirModal() {
    $("#addDir").modal("show")
}

// 选择源文件夹
function selectSourceDir() {
    dialog.showOpenDialog({
        title: "选择源文件夹",
        properties: ["openDirectory"]
    }, (dirPaths) => {
        if (dirPaths.length > 0) {
            document.getElementById("sourceDirPath").value = dirPaths[0]
        }
    })
}

// 选择目标文件夹
function selectTargetDir() {
    if (document.getElementById("sourceDirPath").value.length == 0) {
        alert("请先选择源文件夹")
        return
    }
    dialog.showOpenDialog({
        title: "选择目标文件夹",
        properties: ["openDirectory"]
    }, (dirPaths) => {
        if (dirPaths.length > 0) {
            document.getElementById("targetDirPath").value = dirPaths[0]
        }
    })
}

// 确认添加文件夹
function confirmAddDir() {
    let sourceDirPath = document.getElementById("sourceDirPath").value
    let targetDirPath = document.getElementById("targetDirPath").value
    if (sourceDirPath.length == 0 || (targetDirPath.length == 0)) {
        alert("源文件夹或目标文件夹为空")
        return
    }
    $("#addDir").modal("hide")
    blueStore.saveData(sourceDirPath, targetDirPath, "dir")
    renderHTML()
    document.getElementById("sourceDirPath").value = ""
    document.getElementById("targetDirPath").value = ""
}

// 开始同步
function startCopy() {
    let data = blueStore.getData()
    for (let i = 0; i < data.length; i++) {
        if (data[i].type == "file") {
            copyFile(data[i].source, data[i].target, (err) => {
                if (err) {
                    throw err
                }
            })
        } else if (data[i].type == "dir") {
            copydir(data[i].source, data[i].target, (err) => {
                if (err) {
                    throw err
                }
            })
        }
    }
    alert("同步成功")
}