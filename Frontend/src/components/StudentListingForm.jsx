import React, { useState, useEffect, useRef } from "react";
import { useCampus } from "../context/CampusContext";
import "../styles/StudentListingForm.css";

// Reusable Custom Dropdown for StudentListingForm
const CustomFormSelect = ({ label, icon, value, options, onChange }) => {
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
        <div className="FormGroup" ref={dropdownRef}>
            <label>{label} *</label>
            <div className="FormCustomSelectWrapper">
                <button
                    type="button"
                    className={`FormCustomSelectTrigger ${isOpen ? "open" : ""}`}
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    <div className="TriggerContent">
                        {icon && <i className={icon}></i>}
                        <span className="SelectedText">{value}</span>
                    </div>
                    <i className={`bx bx-chevron-down DropdownChevron ${isOpen ? "rotate" : ""}`}></i>
                </button>

                {isOpen && (
                    <ul className="FormCustomDropdownMenu">
                        {options.map((option) => (
                            <li
                                key={option}
                                className={`FormCustomOptionItem ${value === option ? "selected" : ""}`}
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
    "Central Library North Gate",
    "Engineering Workshop Block",
];

const departmentOptions = [
    "Computer Science & Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical / ECE",
    "Applied Sciences",
];

const conditionOptions = [
    "Brand New (Never used)",
    "Like New (Zero damage)",
    "Good Condition (Fully functional)",
    "Fair / Usable",
];

const categoryOptions = [
    "Drawing & Drafting",
    "Electronics & Sensors",
    "Lab Tools",
    "Core Textbooks",
    "Calculators & Instruments",
];

// Canvas Image Compressor to prevent mobile camera memory crashes
const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let { width, height } = img;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const StudentListingForm = () => {
    const { addStudentListing } = useCampus();

    const [listingType, setListingType] = useState("rent");
    const [formData, setFormData] = useState({
        studentName: "",
        studentPhone: "",
        department: "Computer Science & Engineering",
        hostelBlock: "Block A",
        itemTitle: "",
        category: "Drawing & Drafting",
        rentPerDay: "",
        rentPerWeek: "",
        refundableDeposit: "",
        buyPrice: "",
        originalMrp: "",
        condition: "Good Condition (Fully functional)",
        description: "",
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const [successToast, setSuccessToast] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (field, val) => {
        setFormData((prev) => ({ ...prev, [field]: val }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (files.length + imagePreviews.length > 3) {
            alert("You can upload a maximum of 3 photos.");
            return;
        }

        setIsCompressing(true);
        try {
            for (const file of files) {
                const compressedBase64 = await compressImage(file, 800, 0.7);
                setImagePreviews((prev) => [...prev, compressedBase64]);
            }
        } catch (err) {
            console.error("Image optimization failed:", err);
            alert("Failed to process image. Please try another photo.");
        } finally {
            setIsCompressing(false);
        }
    };

    const handleRemoveImage = (index) => {
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (imagePreviews.length === 0) {
            alert("Please upload at least 1 real photo of your item.");
            return;
        }

        addStudentListing({
            type: listingType,
            ...formData,
            rentPerDay: listingType === "rent" ? Number(formData.rentPerDay) : null,
            rentPerWeek: listingType === "rent" ? Number(formData.rentPerWeek) : null,
            refundableDeposit: listingType === "rent" ? Number(formData.refundableDeposit) || 0 : null,
            buyPrice: listingType === "buy" ? Number(formData.buyPrice) : null,
            originalMrp: listingType === "buy" ? Number(formData.originalMrp) || null : null,
            images: imagePreviews,
        });

        setSuccessToast(true);

        setFormData({
            studentName: "",
            studentPhone: "",
            department: "Computer Science & Engineering",
            hostelBlock: "Block A",
            itemTitle: "",
            category: "Drawing & Drafting",
            rentPerDay: "",
            rentPerWeek: "",
            refundableDeposit: "",
            buyPrice: "",
            originalMrp: "",
            condition: "Good Condition (Fully functional)",
            description: "",
        });
        setImagePreviews([]);

        setTimeout(() => setSuccessToast(false), 4000);
    };

    return (
        <section id="list-gear-section" className="ListingFormSection">
            <div className="FormSectionContainer">
                <div className="SectionTitleDeck">
                    <span className="SectionCategoryPill">LIVE STUDENT SUBMISSION PORTAL</span>
                    <h2 className="SectionHeading">Add Your Real Gear to DBU CampusBazaar</h2>
                    <p className="SectionSubheading">
                        Fill out your details to list your idle drafters, lab equipment, or textbooks for rent or clearance sale.
                    </p>
                </div>

                {successToast && (
                    <div className="SuccessNotificationCard">
                        <i className="bx bxs-check-circle"></i>
                        <div>
                            <strong>Item Added Successfully!</strong>
                            <p>Your item is now live on the website and mobile app in the Hero and Store sections.</p>
                        </div>
                    </div>
                )}

                <div className="ListingFormCard">
                    <div className="FormModeSelector">
                        <button
                            type="button"
                            className={`FormModeBtn ${listingType === "rent" ? "active" : ""}`}
                            onClick={() => setListingType("rent")}
                        >
                            <i className="bx bx-time-five"></i>
                            <span>List for Rent (Daily/Weekly)</span>
                        </button>
                        <button
                            type="button"
                            className={`FormModeBtn ${listingType === "buy" ? "active" : ""}`}
                            onClick={() => setListingType("buy")}
                        >
                            <i className="bx bx-purchase-tag"></i>
                            <span>List for Permanent Sale (Buy & Keep)</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="MainStudentForm">
                        {/* 1. Student Info */}
                        <div className="FormCluster">
                            <div className="ClusterHeader">
                                <span className="ClusterStepNumber">1</span>
                                <div>
                                    <h4>Your Student Contact Details</h4>
                                    <small>For WhatsApp and on-campus physical hand-off</small>
                                </div>
                            </div>

                            <div className="FormGridTriple">
                                <div className="FormGroup">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="studentName"
                                        placeholder="e.g. Ansh Kumar"
                                        value={formData.studentName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="FormGroup">
                                    <label>Mobile / WhatsApp Number *</label>
                                    <input
                                        type="tel"
                                        name="studentPhone"
                                        placeholder="e.g. 9876543210"
                                        value={formData.studentPhone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <CustomFormSelect
                                    label="Hostel / Pickup Point"
                                    icon="bx bx-building"
                                    value={formData.hostelBlock}
                                    options={hostelOptions}
                                    onChange={(val) => handleDropdownChange("hostelBlock", val)}
                                />
                            </div>

                            <div className="FormGridDouble">
                                <CustomFormSelect
                                    label="Department"
                                    icon="bx bx-book"
                                    value={formData.department}
                                    options={departmentOptions}
                                    onChange={(val) => handleDropdownChange("department", val)}
                                />

                                <CustomFormSelect
                                    label="Item Condition"
                                    icon="bx bx-check-circle"
                                    value={formData.condition}
                                    options={conditionOptions}
                                    onChange={(val) => handleDropdownChange("condition", val)}
                                />
                            </div>
                        </div>

                        {/* 2. Item Info */}
                        <div className="FormCluster">
                            <div className="ClusterHeader">
                                <span className="ClusterStepNumber">2</span>
                                <div>
                                    <h4>Item Details</h4>
                                    <small>Give a clear title and specify included accessories</small>
                                </div>
                            </div>

                            <div className="FormGridDouble">
                                <div className="FormGroup">
                                    <label>Item Name / Title *</label>
                                    <input
                                        type="text"
                                        name="itemTitle"
                                        placeholder="e.g. Omega Mini Drafter with Cover"
                                        value={formData.itemTitle}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <CustomFormSelect
                                    label="Category Tag"
                                    icon="bx bx-tag"
                                    value={formData.category}
                                    options={categoryOptions}
                                    onChange={(val) => handleDropdownChange("category", val)}
                                />
                            </div>

                            <div className="FormGroup FullWidth">
                                <label>Description (Optional)</label>
                                <textarea
                                    name="description"
                                    rows="2"
                                    placeholder="e.g. Scales are clear, locking screw works perfectly. Can test before taking."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>
                        </div>

                        {/* 3. Pricing */}
                        <div className="FormCluster">
                            <div className="ClusterHeader">
                                <span className="ClusterStepNumber">3</span>
                                <div>
                                    <h4>{listingType === "rent" ? "Rental Rates & Security" : "Sale Price"}</h4>
                                    <small>Set fair student prices</small>
                                </div>
                            </div>

                            {listingType === "rent" ? (
                                <div className="FormGridTriple">
                                    <div className="FormGroup">
                                        <label>Rent Per Day (₹) *</label>
                                        <div className="CurrencyInputWrapper">
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                name="rentPerDay"
                                                placeholder="10"
                                                min="1"
                                                value={formData.rentPerDay}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="FormGroup">
                                        <label>Rent Per Week (₹) *</label>
                                        <div className="CurrencyInputWrapper">
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                name="rentPerWeek"
                                                placeholder="35"
                                                min="1"
                                                value={formData.rentPerWeek}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="FormGroup">
                                        <label>Refundable Deposit (₹)</label>
                                        <div className="CurrencyInputWrapper">
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                name="refundableDeposit"
                                                placeholder="200"
                                                value={formData.refundableDeposit}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="FormGridDouble">
                                    <div className="FormGroup">
                                        <label>Your Selling Price (₹) *</label>
                                        <div className="CurrencyInputWrapper">
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                name="buyPrice"
                                                placeholder="150"
                                                min="1"
                                                value={formData.buyPrice}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="FormGroup">
                                        <label>Original MRP (₹)</label>
                                        <div className="CurrencyInputWrapper">
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                name="originalMrp"
                                                placeholder="650"
                                                value={formData.originalMrp}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Real Image Upload */}
                        <div className="FormCluster">
                            <div className="ClusterHeader">
                                <span className="ClusterStepNumber">4</span>
                                <div>
                                    <h4>Real Photos ({imagePreviews.length}/3 Uploaded) *</h4>
                                    <small>
                                        {imagePreviews.length === 3
                                            ? "Maximum 3 images reached. Remove an image to change it."
                                            : `Upload ${3 - imagePreviews.length} more photo${3 - imagePreviews.length > 1 ? "s" : ""} from your camera or gallery`}
                                    </small>
                                </div>
                            </div>

                            <div className="ImageUploadDeck">
                                <label className={`ImagePickerDropzone ${imagePreviews.length >= 3 ? "disabled" : ""}`}>
                                    <i className={`bx ${isCompressing ? "bx-loader-alt bx-spin" : "bx-camera"}`}></i>
                                    <span>{isCompressing ? "Optimizing photo..." : "Tap to Capture / Choose Photos"}</span>
                                    <small>Device camera photos auto-compressed for instant mobile upload</small>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={imagePreviews.length >= 3 || isCompressing}
                                    />
                                </label>

                                <div className="PreviewsGrid">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="PreviewCard">
                                            <img src={src} alt={`Real upload ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="RemoveImgBtn"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <i className="bx bx-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="FormActionDeck">
                            <button type="submit" className="SubmitListingBtn" disabled={isCompressing}>
                                <i className="bx bx-upload"></i>
                                <span>Publish Item Now</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default StudentListingForm;