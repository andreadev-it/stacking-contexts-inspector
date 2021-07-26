class TabStatus {
    isPanelActive = false;
    isSidebarActive = false;

    get isBeingInspected() {
        return this.isPanelActive || this.isSidebarActive;
    }
}

export default TabStatus;