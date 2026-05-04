import React from "react";
import TransportRoutes from "./TransportRoutes";
import TransportSettings from "./TransportSettings";

export default function Transport() {
    return (
        <div>
            <TransportRoutes />
            <hr />
            <TransportSettings />
        </div>
    );
}