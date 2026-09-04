import React from "react";
import "../styles/CampusAboutAndSafety.css";

const CampusAboutAndSafety = () => {
    return (
        <div className="AboutAndSafetyWrapper">
            {/* SECTION: ABOUT CAMPUS EX */}
            <section id="about-section" className="AboutSection">
                <div className="AboutContainer">
                    <div className="SectionHeaderCenter">
                        <span className="SectionCategoryPill">CAMPUS CIRCULAR ECONOMY</span>
                        <h2 className="SectionHeading">Why DBU CampusBazaar Exists</h2>
                        <p className="SectionSubheading">
                            Every academic year, hundreds of engineering tools, drafters, and expensive textbooks sit idle in hostel cupboards while new students spend thousands buying the same tools. We bridge this gap directly.
                        </p>
                    </div>

                    <div className="PillarsGrid">
                        <div className="PillarCard">
                            <div className="PillarIconBox">
                                <i className="bx bx-wallet"></i>
                            </div>
                            <h3>Save 85%+ on Academic Expenses</h3>
                            <p>
                                Renting a mini drafter for 14 exam weeks costs around ₹200–₹350 instead of spending ₹1,800+ on a new kit you will never touch after 1st year.
                            </p>
                        </div>

                        <div className="PillarCard">
                            <div className="PillarIconBox">
                                <i className="bx bx-buildings"></i>
                            </div>
                            <h3>Hostel-to-Hostel Handoff</h3>
                            <p>
                                Zero delivery charges and no shipping waiting times. Meet your batchmates or seniors right outside your hostel block or the central library.
                            </p>
                        </div>

                        <div className="PillarCard">
                            <div className="PillarIconBox">
                                <i className="bx bx-transfer-alt"></i>
                            </div>
                            <h3>Peer Skill Barter Integration</h3>
                            <p>
                                Short on cash? Swap 1 hour of CAD modeling, project documentation, or coding debugging help in exchange for lab kit access.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: SAFETY & RETURN PROTOCOL */}
            <section id="safety-section" className="SafetySection">
                <div className="SafetyContainer">
                    <div className="SectionHeaderCenter">
                        <span className="SectionCategoryPill">CAMPUS INTEGRITY & TRUST</span>
                        <h2 className="SectionHeading">Our Safety & Return Protocol</h2>
                        <p className="SectionSubheading">
                            Every borrow and purchase transaction is verified under Desh Bhagat University student conduct rules.
                        </p>
                    </div>

                    <div className="ProtocolStepsGrid">
                        <div className="StepCard">
                            <span className="StepIndex">01</span>
                            <h4>Campus ID Verification</h4>
                            <p>
                                Both borrower and lender verify their active DBU identity cards before handing over any lab tools or components.
                            </p>
                        </div>

                        <div className="StepCard">
                            <span className="StepIndex">02</span>
                            <h4>Joint Condition Check</h4>
                            <p>
                                Inspect the equipment together at the meetup spot (checking scale alignment, clamps, breadboard pins, or page counts).
                            </p>
                        </div>

                        <div className="StepCard">
                            <span className="StepIndex">03</span>
                            <h4>Refundable Security Deposit</h4>
                            <p>
                                For rentals, the agreed deposit is transferred directly via UPI upon handover and held until safe return.
                            </p>
                        </div>

                        <div className="StepCard">
                            <span className="StepIndex">04</span>
                            <h4>Immediate Deposit Return</h4>
                            <p>
                                When the borrower hands the gear back in working condition, the security deposit is refunded on the spot.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CampusAboutAndSafety;