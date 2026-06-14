export const getTierFromPoints = (points) => {
    if (!points && points !== 0) return null;
    
    if (points >= 5000) return "Hall of Fame";
    if (points >= 3500) return "Diamond";
    if (points >= 2000) return "Platinum";
    if (points >= 1000) return "Gold";
    if (points >= 500) return "Silver";
    return "Bronze";
};

export const getTierBadgeStyles = (tier) => {
    switch (tier) {
        case "Hall of Fame":
            return {
                bg: "bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500",
                text: "text-white",
                border: "border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.8)]",
                icon: "👑"
            };
        case "Diamond":
            return {
                bg: "bg-gradient-to-r from-cyan-400 to-blue-500",
                text: "text-white",
                border: "border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
                icon: "💎"
            };
        case "Platinum":
            return {
                bg: "bg-gradient-to-r from-slate-300 to-slate-500",
                text: "text-white",
                border: "border-slate-200 shadow-[0_0_8px_rgba(148,163,184,0.6)]",
                icon: "✨"
            };
        case "Gold":
            return {
                bg: "bg-gradient-to-r from-yellow-300 to-yellow-600",
                text: "text-white",
                border: "border-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.6)]",
                icon: "🥇"
            };
        case "Silver":
            return {
                bg: "bg-gradient-to-r from-gray-300 to-gray-400",
                text: "text-white",
                border: "border-gray-200",
                icon: "🥈"
            };
        case "Bronze":
        default:
            return {
                bg: "bg-gradient-to-r from-amber-600 to-orange-700",
                text: "text-white",
                border: "border-amber-500",
                icon: "🥉"
            };
    }
};

export const GamificationBadge = ({ points }) => {
    if (points === undefined || points === null) return null;
    
    const tier = getTierFromPoints(points);
    if (!tier) return null;

    const styles = getTierBadgeStyles(tier);

    return (
        <span 
            title={`${points} Points`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles.bg} ${styles.text} ${styles.border}`}
        >
            <span className="text-[12px]">{styles.icon}</span>
            {tier}
        </span>
    );
};

export const getGamificationTier = (points) => {
    const name = getTierFromPoints(points) || "Bronze";
    const styles = getTierBadgeStyles(name);
    
    let colorClass = "text-amber-600";
    let colorClassLight = "text-amber-700";
    let colorClassDark = "text-amber-400";

    if (name === "Hall of Fame") { colorClass = "text-red-500"; colorClassLight = "text-red-600"; colorClassDark = "text-red-400"; }
    else if (name === "Diamond") { colorClass = "text-cyan-500"; colorClassLight = "text-cyan-700"; colorClassDark = "text-cyan-400"; }
    else if (name === "Platinum") { colorClass = "text-slate-400"; colorClassLight = "text-slate-700"; colorClassDark = "text-slate-300"; }
    else if (name === "Gold") { colorClass = "text-yellow-500"; colorClassLight = "text-yellow-600"; colorClassDark = "text-yellow-400"; }
    else if (name === "Silver") { colorClass = "text-gray-400"; colorClassLight = "text-gray-700"; colorClassDark = "text-gray-300"; }

    return {
        name,
        icon: styles.icon,
        colorClass,
        colorClassLight,
        colorClassDark
    };
};
