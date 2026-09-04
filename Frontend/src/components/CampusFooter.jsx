import React from "react";
import WebLogo from "../assets/CampusImage/WebLogo.png";
import "../styles/CampusFooter.css";

const CampusFooter = () => {
    const scrollTo = (id) => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="FooterModernRoot">
            {/* Top University Integrity Banner */}
            <div className="FooterAssuranceBand">
                <div className="AssuranceContainer">
                    <div className="AssuranceItem">
                        <i className="bx bxs-check-shield"></i>
                        <div>
                            <strong>100% University Verified</strong>
                            <span>Restricted to active DBU Roll Numbers</span>
                        </div>
                    </div>
                    <div className="AssuranceDivider"></div>
                    <div className="AssuranceItem">
                        <i className="bx bx-buildings"></i>
                        <div>
                            <strong>Physical Hostel Handoffs</strong>
                            <span>Zero courier delays, inspect before paying</span>
                        </div>
                    </div>
                    <div className="AssuranceDivider"></div>
                    <div className="AssuranceItem">
                        <i className="bx bx-refresh"></i>
                        <div>
                            <strong>Deposit Refund Guarantee</strong>
                            <span>Instant return upon intact equipment handback</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="FooterMainDeck">
                <div className="FooterGridContainer">

                    {/* Brand Summary */}
                    <div className="FooterCol BrandPanel">
                        <div className="FooterBrandGroup" onClick={scrollToTop}>
                            <div className="FooterLogoWrapper">
                                <img src={WebLogo} alt="CampusBazaar" className="FooterLogoImg" />
                            </div>
                            <div className="FooterBrandMeta">
                                <div className="BrandTitle">
                                    <span className="NavyWord">Campus</span>
                                    <span className="GoldWord">Bazaar</span>
                                </div>
                                <span className="BrandSubTag">Desh Bhagat University Hub</span>
                            </div>
                        </div>

                        <p className="BrandNarrative">
                            A student-engineered circular economy platform. We eliminate single-semester academic equipment waste by enabling peer-to-peer micro-rentals and clearance sales.
                        </p>

                        <div className="LocationBadgeRow">
                            <span className="LocationChip">
                                <i className="bx bx-map-pin"></i> Mandi Gobindgarh, Punjab
                            </span>
                            <span className="CampusStatusChip">
                                <span className="PulseDot"></span> Live On Campus
                            </span>
                        </div>
                    </div>

                    {/* Direct Section Links */}
                    <div className="FooterCol">
                        <h4 className="FooterColHeading">Explore Portal</h4>
                        <ul className="FooterLinkList">
                            <li>
                                <button type="button" onClick={() => scrollTo("list-gear-section")}>
                                    <i className="bx bx-chevron-right"></i> List Idle Gear
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => scrollTo("fresher-store-section")}>
                                    <i className="bx bx-chevron-right"></i> Campus Clearance Store
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => scrollTo("about-section")}>
                                    <i className="bx bx-chevron-right"></i> Circular Economy Model
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => scrollTo("safety-section")}>
                                    <i className="bx bx-chevron-right"></i> Safety & Deposit Rules
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Academic Categories */}
                    <div className="FooterCol">
                        <h4 className="FooterColHeading">Resource Types</h4>
                        <ul className="FooterLinkList staticList">
                            <li><i className="bx bx-ruler"></i> Drafters & Engineering Drawing</li>
                            <li><i className="bx bx-chip"></i> Arduino & Sensor Lab Kits</li>
                            <li><i className="bx bx-calculator"></i> Scientific Calculators</li>
                            <li><i className="bx bx-book-bookmark"></i> Semester Core Textbooks</li>
                            <li><i className="bx bx-wrench"></i> Workshop & Lab Aprons</li>
                        </ul>
                    </div>

                    {/* Active Verified Meetup Points */}
                    <div className="FooterCol">
                        <h4 className="FooterColHeading">Hostel Meetup Points</h4>
                        <div className="HostelChipsGrid">
                            <span className="HostelChip">Block A</span>
                            <span className="HostelChip">Block B</span>
                            <span className="HostelChip">Block C</span>
                            <span className="HostelChip">Block D</span>
                            <span className="HostelChip">Block E</span>
                            <span className="HostelChip">Khalsa Hostel</span>
                            <span className="HostelChip">Sirhind Hostel</span>
                            <span className="HostelChip">Girls Hostel</span>
                            <span className="HostelChip">Library Lawn</span>
                            <span className="HostelChip">Workshop Gate</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Legal Band & Scroll-to-Top */}
            <div className="FooterBottomSubBand">
                <div className="BottomBandContainer">
                    <p className="CopyrightText">
                        © 2026 <strong>CampusBazaar</strong> · Engineered by and for students of Desh Bhagat University.
                    </p>

                    <div className="FooterBadges">
                        <span className="BadgeTag">Non-Profit Student Utility</span>
                        <span className="BulletDot">•</span>
                        <span className="BadgeTag">Hostel Verified</span>
                        <button type="button" className="BackToTopBtn" onClick={scrollToTop} title="Back to top">
                            <i className="bx bx-up-arrow-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default CampusFooter;