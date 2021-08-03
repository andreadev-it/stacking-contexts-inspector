/**
 * This class is used to represent the status of a tab. It contains informations on whether or not this
 * tab is currently inspected and which script they are connected to (panel, sidebar or both).
 * This class is manly used to check whether or not the DOM Observer should run.
 * 
 * @property {boolean} isPanelActive Indicates whether the tab is being inspected with the Stacking Context Inspector panel or not
 * @property {boolean} isSidebarActive Indicates whether the tab is being inspected from the Stacking Context sidebar within the Elements panel or not
 */
class TabStatus {
    isPanelActive = false;
    isSidebarActive = false;

    get isBeingInspected() {
        return this.isPanelActive || this.isSidebarActive;
    }
}

export default TabStatus;