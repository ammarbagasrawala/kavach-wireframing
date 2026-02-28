"use client";

export const addAuditLog = (action: string, details: string, status: "Success" | "Info" | "Warning" | "Error" = "Success") => {
    if (typeof window === "undefined") return;

    const logs = JSON.parse(localStorage.getItem("kavach_audit_logs") || "[]");
    const newLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        details,
        time: "Just Now",
        timestamp: new Date().toISOString(),
        status,
        entity: "Identity Holder"
    };

    logs.unshift(newLog);
    localStorage.setItem("kavach_audit_logs", JSON.stringify(logs.slice(0, 50)));

    // Dispatch a custom event so other components can listen for updates if needed
    window.dispatchEvent(new CustomEvent('kavach_audit_log_added', { detail: newLog }));
};
