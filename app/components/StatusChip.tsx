"use client";

import React from "react";
import LoKeyChip from "./LoKeyChip";

type StatusType =
    | "draft"
    | "published"
    | "in-review"
    | "change-requested"
    | "in-progress"
    | "initiated"
    | "completed"
    | "rejected"
    | "pending";

interface StatusChipProps {
    status: StatusType | string;
    className?: string;
}

const statusMapping: Record<string, { label: string; type: any }> = {
    draft: { label: "Draft", type: "neutral" },
    published: { label: "Published", type: "success" },
    "in-review": { label: "In Review", type: "warning" },
    "change-requested": { label: "Change Requested", type: "error" },
    "in-progress": { label: "In Progress", type: "primary" },
    initiated: { label: "Initiated", type: "info" },
    completed: { label: "Completed", type: "success" },
    rejected: { label: "Rejected", type: "error" },
    pending: { label: "Pending", type: "warning" },
};

const StatusChip: React.FC<StatusChipProps> = ({ status, className }) => {
    const config = statusMapping[status.toLowerCase()] || { label: status, type: "neutral" };

    return (
        <LoKeyChip variant="accent" type={config.type} size="s" className={className}>
            {config.label}
        </LoKeyChip>
    );
};

export default StatusChip;
