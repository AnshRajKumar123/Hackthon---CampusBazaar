import React, { useState, useEffect, useRef } from "react";
import { useCampus } from "../context/CampusContext";
import "../styles/StudentListingForm.css";

// Reusable Custom Dropdown
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

// In-browser Canvas Compressor: scales down high-res mobile photos
const compressImage = (file, maxWidth = 900, quality = 0.75) => {
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

// Converts compressed Base64 dataURL to real binary File for Multer FormData
const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const StudentListingForm = () => {
    const { addStudentListing, currentUser } = useCampus();

    const [listingType, setListingType] = useState("rent");
    const [formData, setFormData] = useState({
        studentName: currentUser?.name || "",
        studentPhone: currentUser?.phone || "",
        department: currentUser?.department || "Computer Science & Engineering",
        hostelBlock: currentUser?.hostelBlock || "Block A",
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successToast, setSuccessToast] = useState(false);

    // Sync profile values if user logs in after page mount
    useEffect(() => {
        if (currentUser) {
            setFormData((prev) => ({
                ...prev,
                studentName: prev.studentName || currentUser.name || "",
                studentPhone: prev.studentPhone || currentUser.phone || "",
                department: currentUser.department || prev.department,
                hostelBlock: currentUser.hostelBlock || prev.hostelBlock,
            }));
        }
    }, [currentUser]);

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
                const compressedBase64 = await compressImage(file, 900, 0.75);
                setImagePreviews((prev) => [...prev, compressedBase64]);
            }
        } catch (err) {
            console.error("Image optimization failed:", err);
            alert("Failed to process photo. Please try another image.");
        } finally {
            setIsCompressing(false);
        }
    };

    const handleRemoveImage = (index) => {
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (imagePreviews.length === 0) {
            alert("Please upload at least 1 photo of your item.");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = new FormData();
            payload.append("type", listingType);
            payload.append("studentName", formData.studentName);
            payload.append("studentPhone", formData.studentPhone);
            payload.append("department", formData.department);
            payload.append("hostelBlock", formData.hostelBlock);
            payload.append("itemTitle", formData.itemTitle);
            payload.append("category", formData.category);
            payload.append("condition", formData.condition);
            payload.append("description", formData.description);

            if (listingType === "rent") {
                payload.append("rentPerDay", Number(formData.rentPerDay));
                payload.append("rentPerWeek", Number(formData.rentPerWeek));
                payload.append("refundableDeposit", Number(formData.refundableDeposit) || 0);
            } else {
                payload.append("buyPrice", Number(formData.buyPrice));
                payload.append("originalMrp", Number(formData.originalMrp) || 0);
            }

            // Convert compressed previews into binary files for Multer
            imagePreviews.forEach((base64, index) => {
                const file = dataURLtoFile(base64, `gear_${Date.now()}_${index}.jpg`);
                payload.append("images", file);
            });

            await addStudentListing(payload);

            setSuccessToast(true);
            setFormData({
                studentName: currentUser?.name || "",
                studentPhone: currentUser?.phone || "",
                department: currentUser?.department || "Computer Science & Engineering",
                hostelBlock: currentUser?.hostelBlock || "Block A",
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
        } catch (err) {
            console.error("Submission failed:", err);
            alert("Could not publish item. Please ensure backend is running.");
        } finally {
            setIsSubmitting(false);
        }
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
                            <p>Your item is now live in MongoDB Atlas and available to all students across campus.</p>
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
                        {/* 1. Student Contact Info */}
                        <div className="FormCluster">
                            <div className="ClusterHeader">
                                <span className="ClusterStepNumber">1</span>
                                <div>
                                    <h4>Your Student Contact Details</h4>
                                    <small>Used for WhatsApp communication and campus physical hand-off</small>
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

                        {/* 2. Item Information */}
                        <div className="FormCluster">
                            <div className="ClusterHeader">
                                <span className="ClusterStepNumber">2</span>
                                <div>
                                    <h4>Item Details</h4>
                                    <small>Give an accurate title and state what comes included</small>
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
                                    placeholder="e.g. Scales are clear, locking screw works perfectly. Can inspect before taking."
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
                                    <small>Set transparent pricing for students</small>
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

                        {/* 4. Real Photos */}
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
                                    <span>{isCompressing ? "Compressing photo..." : "Tap to Capture / Choose Photos"}</span>
                                    <small>Camera photos automatically resized to preserve performance</small>
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
                                            <img src={src} alt={`Upload preview ${index + 1}`} />
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
                            <button
                                type="submit"
                                className="SubmitListingBtn"
                                disabled={isCompressing || isSubmitting}
                            >
                                <i className={`bx ${isSubmitting ? "bx-loader-alt bx-spin" : "bx-upload"}`}></i>
                                <span>{isSubmitting ? "Uploading to Cloud..." : "Publish Item Now"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default StudentListingForm;