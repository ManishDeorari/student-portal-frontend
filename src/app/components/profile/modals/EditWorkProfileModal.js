




























    });
    const [skills, setSkills] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setWorkProfile({
                functionalArea: currentWorkProfile?.functionalArea || "",
                subFunctionalArea: currentWorkProfile?.subFunctionalArea || "",
                experience: currentWorkProfile?.experience || "",
                industry: currentWorkProfile?.industry || ""
            });
            setSkills(Array.isArray(currentSkills) ? currentSkills.join(", ") : "");
        }
    }, [currentWorkProfile, currentSkills, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setWorkProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",