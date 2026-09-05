import React, { useState, useEffect, useRef } from "react";
import WebLogo from "../assets/CampusImage/WebLogo.png";
import { useCampus } from "../context/CampusContext";
import "../styles/AuthModal.css";

// Reusable Custom Dropdown Component
const CustomSelect = ({ label, icon, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
        <div className="AuthInputGroup" ref={dropdownRef}>
            <label>{label}</label>
            <div className="CustomSelectWrapper">
                <button
                    type="button"
                    className={`CustomSelectTrigger ${isOpen ? "open" : ""}`}
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    <i className={icon}></i>
                    <span className="SelectedValueText">{value}</span>
                    <i className={`bx bx-chevron-down DropdownArrow ${isOpen ? "rotate" : ""}`}></i>
                </button>

                {isOpen && (
                    <ul className="CustomDropdownMenu">
                        {options.map((option) => (
                            <li
                                key={option}
                                className={`CustomOptionItem ${value === option ? "selected" : ""}`}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                            >
                                <span>{option}</span>
                                {value === option && <i className="bx bx-check"></i>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const departmentOptions = [
    "Computer Science & Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical / ECE",
    "Applied Sciences",
];

const hostelOptions = [
    "Block A",
    "Block B",
    "Block C",
    "Block D",
    "Block E",
    "Block F / Khalsa Hostel",
    "Sirhind Hostel",
    "Girls Hostel",
    "Girls Hostel / Khanna",
    "Room Renter",
];

const AuthModal = ({ isFullScreen = false, onClose }) => {
    const { loginUser, registerUser } = useCampus();
    const [activeTab, setActiveTab] = useState("login");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        rollNo: "",
        password: "",
        confirmPassword: "",
        department: "Computer Science & Engineering",
        hostelBlock: "Block A",
        phone: "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrorMessage("");
    };

    const handleDropdownChange = (field, val) => {
        setFormData((prev) => ({ ...prev, [field]: val }));
        setErrorMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (activeTab === "register") {
            if (formData.password !== formData.confirmPassword) {
                setErrorMessage("Passwords do not match!");
                return;
            }
            if (formData.password.length < 4) {
                setErrorMessage("Password must be at least 4 characters.");
                return;
            }

            setIsSubmitting(true);
            try {
                const res = await registerUser({
                    name: formData.name,
                    rollNo: formData.rollNo,
                    password: formData.password,
                    department: formData.department,
                    hostelBlock: formData.hostelBlock,
                    phone: formData.phone,
                });

                if (!res.success) {
                    setErrorMessage(res.message || "Failed to register student.");
                    return;
                }
                if (onClose) onClose();
            } catch (err) {
                setErrorMessage("Server error during registration. Check server status.");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setIsSubmitting(true);
            try {
                const res = await loginUser(formData.rollNo, formData.password);
                if (!res.success) {
                    setErrorMessage(res.message || "Invalid roll number or password.");
                    return;
                }
                if (onClose) onClose();
            } catch (err) {
                setErrorMessage("Server error during login. Check server status.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className={isFullScreen ? "AuthSplitScreenWrapper" : "ModalOverlay"}>
            <div className="AuthSplitStage">
                {!isFullScreen && onClose && (
                    <button type="button" className="AuthStageClose" onClick={onClose}>
                        <i className="bx bx-x"></i>
                    </button>
                )}

                {/* Left Showcase */}
                <aside className="AuthSideShowcase">
                    <div className="ShowcaseHeader">
                        <img src={WebLogo} alt="CampusBazaar" className="ShowcaseLogo" />
                        <div>
                            <span className="ShowcaseBadge">OFFICIAL STUDENT NETWORK</span>
                            <h3>Desh Bhagat University</h3>
                        </div>
                    </div>

                    <div className="ShowcaseHero">
                        <h2>Borrow, Rent & Trade Semester Gear Instantly.</h2>
                        <p>
                            Save 80%+ on drawing drafters, lab instruments, and reference books directly from batchmates across DBU hostels.
                        </p>
                    </div>

                    <div className="ShowcaseFeatureList">
                        <div className="FeatureRow">
                            <div className="FeatureIcon"><i className="bx bx-shield-quarter"></i></div>
                            <div>
                                <strong>Verified University Accounts</strong>
                                <span>Restricted strictly to active DBU Roll Numbers</span>
                            </div>
                        </div>
                        <div className="FeatureRow">
                            <div className="FeatureIcon"><i className="bx bx-time-five"></i></div>
                            <div>
                                <strong>Micro-Rentals from ₹10/day</strong>
                                <span>Keep your budget safe with 100% refundable security deposits</span>
                            </div>
                        </div>
                        <div className="FeatureRow">
                            <div className="FeatureIcon"><i className="bx bx-transfer-alt"></i></div>
                            <div>
                                <strong>Hostel Hand-offs</strong>
                                <span>Quick physical pick-ups at Hostel 1, 2, 3 & Library lawn</span>
                            </div>
                        </div>
                    </div>

                    <div className="ShowcaseFooter">
                        <span>© 2026 CampusBazaar · Non-Profit Student Utility</span>
                    </div>
                </aside>

                {/* Right Form Interaction Panel */}
                <main className="AuthMainPanel">
                    <div className="AuthSegmentedNav">
                        <button
                            type="button"
                            className={`SegmentTab ${activeTab === "login" ? "active" : ""}`}
                            onClick={() => { setActiveTab("login"); setErrorMessage(""); }}
                        >
                            <i className="bx bx-log-in-circle"></i>
                            <span>Sign In</span>
                        </button>
                        <button
                            type="button"
                            className={`SegmentTab ${activeTab === "register" ? "active" : ""}`}
                            onClick={() => { setActiveTab("register"); setErrorMessage(""); }}
                        >
                            <i className="bx bx-user-plus"></i>
                            <span>New Student</span>
                        </button>
                    </div>

                    <div className="AuthHeadingWrap">
                        <h2>{activeTab === "login" ? "Welcome back!" : "Join CampusBazaar"}</h2>
                        <p>
                            {activeTab === "login"
                                ? "Sign in with your University Roll No / CRM to continue."
                                : "Create your student account to list idle gear or rent."}
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="AuthAlertBanner">
                            <i className="bx bx-error-circle"></i>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="AuthMainForm">
                        {activeTab === "register" && (
                            <div className="AuthInputGroup">
                                <label>Your Full Name *</label>
                                <div className="InputWithIcon">
                                    <i className="bx bx-user InputLeadingIcon"></i>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Gurpreet Singh"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="AuthInputGroup">
                            <label>CRM / University Roll Number *</label>
                            <div className="InputWithIcon">
                                <i className="bx bx-id-card InputLeadingIcon"></i>
                                <input
                                    type="text"
                                    name="rollNo"
                                    placeholder="e.g. 2101034 or CRM-8942"
                                    value={formData.rollNo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {activeTab === "register" && (
                            <>
                                <div className="AuthInputGroup">
                                    <label>WhatsApp / Phone Number</label>
                                    <div className="InputWithIcon">
                                        <i className="bx bxl-whatsapp InputLeadingIcon"></i>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="9876543210"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="AuthDualFields">
                                    <CustomSelect
                                        label="Department"
                                        icon="bx bx-book InputLeadingIcon"
                                        value={formData.department}
                                        options={departmentOptions}
                                        onChange={(val) => handleDropdownChange("department", val)}
                                    />

                                    <CustomSelect
                                        label="Hostel Block"
                                        icon="bx bx-building InputLeadingIcon"
                                        value={formData.hostelBlock}
                                        options={hostelOptions}
                                        onChange={(val) => handleDropdownChange("hostelBlock", val)}
                                    />
                                </div>
                            </>
                        )}

                        <div className="AuthInputGroup">
                            <label>Password *</label>
                            <div className="InputWithIcon">
                                <i className="bx bx-lock-alt InputLeadingIcon"></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter account password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="ToggleEyeBtn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowPassword((prev) => !prev);
                                    }}
                                >
                                    <i className={`bx ${showPassword ? "bx-hide" : "bx-show"}`}></i>
                                </button>
                            </div>
                        </div>

                        {activeTab === "register" && (
                            <div className="AuthInputGroup">
                                <label>Confirm Password *</label>
                                <div className="InputWithIcon">
                                    <i className="bx bx-check-shield InputLeadingIcon"></i>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Repeat your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="ToggleEyeBtn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowConfirmPassword((prev) => !prev);
                                        }}
                                    >
                                        <i className={`bx ${showConfirmPassword ? "bx-hide" : "bx-show"}`}></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="AuthActionPrimary" disabled={isSubmitting}>
                            <span>
                                {isSubmitting
                                    ? "Connecting to Database..."
                                    : activeTab === "login"
                                        ? "Enter CampusBazaar"
                                        : "Create My Student Account"}
                            </span>
                            <i className={`bx ${isSubmitting ? "bx-loader-alt bx-spin" : "bx-right-arrow-alt"}`}></i>
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default AuthModal;