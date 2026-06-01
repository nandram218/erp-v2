import React from "react";
import { FEE_ENGINE_CONFIG } from "../fee-engine/feeEngineConfig";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error, info) {
        if (FEE_ENGINE_CONFIG?.LOG_MODE) {
            console.error("[ERP ERROR BOUNDARY]", error, info);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: 20,
                    margin: 20,
                    background: "#1f2937",
                    color: "#fff",
                    borderRadius: 12
                }}>
                    <h2>⚠️ System Error Detected</h2>
                    <p>ERP module encountered an issue.</p>

                    {FEE_ENGINE_CONFIG?.STRICT_MODE && (
                        <pre style={{ color: "#fca5a5" }}>
                            {String(this.state.error)}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;