"use client";

const USER_LOGS_KEY = "kavach_audit_logs";
const BANK_LOGS_KEY = "kavach_bank_audit_logs";

export const addAuditLog = (action: string, details: string, status: "Success" | "Info" | "Warning" | "Error" = "Success") => {
    if (typeof window === "undefined") return;

    const logs = JSON.parse(localStorage.getItem(USER_LOGS_KEY) || "[]");
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
    localStorage.setItem(USER_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('kavach_audit_log_added', { detail: newLog }));
};

/** Bank portal audit log – stored separately from user (identity holder) logs. */
export const addBankAuditLog = (action: string, details: string, status: "Success" | "Info" | "Warning" | "Error" = "Success") => {
    if (typeof window === "undefined") return;

    const logs = JSON.parse(localStorage.getItem(BANK_LOGS_KEY) || "[]");
    const newLog = {
        id: `bank-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        details,
        time: "Just Now",
        timestamp: new Date().toISOString(),
        status,
        entity: "Bank"
    };

    logs.unshift(newLog);
    localStorage.setItem(BANK_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('kavach_bank_audit_log_added', { detail: newLog }));
};

export function getBankAuditLogs(): Array<{ id: string; action: string; details: string; time: string; status: string; entity: string }> {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(BANK_LOGS_KEY) || "[]");
}
