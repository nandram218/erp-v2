import React from "react";

import {
    sectionCard,
    sectionHeader,
    sectionTitle,
    sectionSubTitle,
} from "../styles/studentFormStyles";

const ERPSectionCard = ({
    title,
    subtitle,
    action,
    children,
}) => {
    return (
        <div style={sectionCard}>

            <div style={sectionHeader}>

                <div>

                    <div style={sectionTitle}>
                        {title}
                    </div>

                    {subtitle && (
                        <div style={sectionSubTitle}>
                            {subtitle}
                        </div>
                    )}

                </div>

                {action}

            </div>

            {children}

        </div>
    );
};

export default ERPSectionCard;