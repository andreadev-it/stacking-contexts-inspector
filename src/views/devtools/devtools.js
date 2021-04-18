chrome.devtools.panels.create("Stacking Contexts", "", "/views/panel/panel.html");

chrome.devtools.panels.elements.createSidebarPane("Stacking Contexts", (sidebar) => {
    sidebar.setPage("/views/elements-sidebar/sidebar-preact.html");
});