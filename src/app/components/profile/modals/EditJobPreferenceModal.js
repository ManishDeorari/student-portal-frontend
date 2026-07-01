




























        portfolioLink: ""
    });
    const [locationsInput, setLocationsInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentPreferences && isOpen) {
            setPreferences({
                functionalArea: currentPreferences.functionalArea || "",
                preferredLocations: currentPreferences.preferredLocations || [],
                noticePeriod: currentPreferences.noticePeriod || "",
                salary: currentPreferences.salary || "",
                resumeLink: currentPreferences.resumeLink || "",
                portfolioLink: currentPreferences.portfolioLink || ""
            });
            setLocationsInput((currentPreferences.preferredLocations || []).join(", "));
        }
    }, [currentPreferences, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
    };

    const handleLocationsChange = (value) => {
        setLocationsInput(value);
        const locations = value.split(",").map(lang => lang.trim()).filter(Boolean);
        setPreferences(prev => ({ ...prev, preferredLocations: locations }));
    };
