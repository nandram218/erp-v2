import React, { useEffect, useState } from "react";
import "../styles/transport.css";

const defaultState = {
    routeName: "",
    vehicleNumber: "",
    vehicleType: "Bus",
    driverName: "",
    driverPhone: "",
    monthlyFee: "",
    gpsEnabled: true,
    liveTrackingEnabled: true,
    active: true,
    pickupPoints: [],
};

const TransportForm = ({ selectedRoute, onSave }) => {
    const [form, setForm] = useState(defaultState);
    const [pickupPoint, setPickupPoint] = useState("");

    useEffect(() => {
        if (selectedRoute) {
            setForm(selectedRoute);
        }
    }, [selectedRoute]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const addPickupPoint = () => {
        if (!pickupPoint.trim()) return;

        setForm((prev) => ({
            ...prev,
            pickupPoints: [...prev.pickupPoints, pickupPoint],
        }));

        setPickupPoint("");
    };

    const removePickupPoint = (index) => {
        setForm((prev) => ({
            ...prev,
            pickupPoints: prev.pickupPoints.filter(
                (_, i) => i !== index
            ),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onSave({
            ...form,
            monthlyFee: Number(form.monthlyFee || 0),
        });

        setForm(defaultState);
    };

    return (
        <form
            className="transport-form"
            onSubmit={handleSubmit}
        >
            <div className="section-header">
                <div>
                    <h2>Transport Route Management</h2>
                    <p>
                        Create and manage professional ERP
                        transport routes
                    </p>
                </div>

                <div className="live-status">
                    ● Live Tracking Ready
                </div>
            </div>

            <div className="transport-grid">
                <div className="field-group">
                    <label>Route Name</label>

                    <input
                        type="text"
                        name="routeName"
                        value={form.routeName}
                        onChange={handleChange}
                        placeholder="Enter route name"
                    />
                </div>

                <div className="field-group">
                    <label>Vehicle Number</label>

                    <input
                        type="text"
                        name="vehicleNumber"
                        value={form.vehicleNumber}
                        onChange={handleChange}
                        placeholder="RJ14 AB 1234"
                    />
                </div>

                <div className="field-group">
                    <label>Vehicle Type</label>

                    <select
                        name="vehicleType"
                        value={form.vehicleType}
                        onChange={handleChange}
                    >
                        <option value="Bus">Bus</option>
                        <option value="Mini Bus">
                            Mini Bus
                        </option>
                        <option value="Van">Van</option>
                    </select>
                </div>

                <div className="field-group">
                    <label>Driver Name</label>

                    <input
                        type="text"
                        name="driverName"
                        value={form.driverName}
                        onChange={handleChange}
                        placeholder="Enter driver name"
                    />
                </div>

                <div className="field-group">
                    <label>Driver Phone</label>

                    <input
                        type="text"
                        name="driverPhone"
                        value={form.driverPhone}
                        onChange={handleChange}
                        placeholder="9876543210"
                    />
                </div>

                <div className="field-group">
                    <label>Monthly Fee</label>

                    <input
                        type="number"
                        name="monthlyFee"
                        value={form.monthlyFee}
                        onChange={handleChange}
                        placeholder="2500"
                    />
                </div>
            </div>

            <div className="pickup-section">
                <div className="pickup-header">
                    <h3>Pickup Points</h3>
                </div>

                <div className="pickup-row">
                    <input
                        type="text"
                        value={pickupPoint}
                        onChange={(e) =>
                            setPickupPoint(e.target.value)
                        }
                        placeholder="Add pickup point"
                    />

                    <button
                        type="button"
                        className="add-btn"
                        onClick={addPickupPoint}
                    >
                        Add
                    </button>
                </div>

                <div className="pickup-list">
                    {form.pickupPoints.map(
                        (point, index) => (
                            <div
                                className="pickup-chip"
                                key={index}
                            >
                                <span>{point}</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removePickupPoint(
                                            index
                                        )
                                    }
                                >
                                    ×
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="toggle-grid">
                <label className="toggle-card">
                    <input
                        type="checkbox"
                        name="gpsEnabled"
                        checked={form.gpsEnabled}
                        onChange={handleChange}
                    />

                    <span>GPS Enabled</span>
                </label>

                <label className="toggle-card">
                    <input
                        type="checkbox"
                        name="liveTrackingEnabled"
                        checked={form.liveTrackingEnabled}
                        onChange={handleChange}
                    />

                    <span>Live Tracking</span>
                </label>

                <label className="toggle-card">
                    <input
                        type="checkbox"
                        name="active"
                        checked={form.active}
                        onChange={handleChange}
                    />

                    <span>Route Active</span>
                </label>
            </div>

            <div className="transport-summary">
                <div className="summary-card">
                    <h4>Vehicle</h4>
                    <p>{form.vehicleNumber || "--"}</p>
                </div>

                <div className="summary-card">
                    <h4>Driver</h4>
                    <p>{form.driverName || "--"}</p>
                </div>

                <div className="summary-card">
                    <h4>Pickup Points</h4>
                    <p>{form.pickupPoints.length}</p>
                </div>

                <div className="summary-card">
                    <h4>Monthly Fee</h4>
                    <p>
                        ₹{" "}
                        {Number(
                            form.monthlyFee || 0
                        ).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    className="save-btn"
                >
                    Save Transport Route
                </button>
            </div>
        </form>
    );
};

export default TransportForm;