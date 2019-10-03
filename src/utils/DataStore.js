const Store = require("electron-store")
const uuid = require("uuid/v4")

class DataStore extends Store {
    constructor(settings) {
        super(settings)
        this.data = []
    }
    getData() {
        return this.get("source-and-target") || []
    }
    saveData(source, target, type) {
        let saveItem = [{
            id: uuid(),
            type: type,
            source: source,
            target: target
        }]
        let sourceInDataStore = this.getData().map((item) => {
            return item.source
        })
        let afterFilter = saveItem.filter((item) => {
            // return sourceInDataStore.includes(item.source) === false
            return sourceInDataStore.indexOf(item.source) == "-1"
        })
        this.set("source-and-target", [...this.getData(), ...afterFilter])
    }
    deleteInfo() {

    }
}

module.exports = DataStore