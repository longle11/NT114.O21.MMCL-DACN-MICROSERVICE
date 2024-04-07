class StoreListComments {
    sotredComments = null

    setComments(data) {
        this.sotredComments = data
    }
    getComments() {
        return this.sotredComments
    }
}

const storeListComments = new StoreListComments()

export default storeListComments