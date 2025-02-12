import Header from "../components/Header";
import { FaRegMap, FaPhoneAlt, FaClock } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import ContactForm from "../components/ContactForm";

const ContactPage = () => {
  const combinedText = {
    text1: "#lets's_talk",
    text2: "Leave A Message, We love to hear from you!",
    url: "https://nike0197.netlify.app/assets/1-f4da6767.jpg",
  };
  return (
    <>
      <div>
        <Header combinedText={combinedText} />
      </div>
      <div className="contact-details">
        <div className="company-details">
          <span>GET IN TOUCH</span>
          <h2>Visit one of our agency location or contact us today</h2>
          <h3>Head Office</h3>
          <div className="contactAddress">
            <ul type="none">
              <li>
                <div>
                  <FaRegMap />
                </div>{" "}
                Sensburger Allee 30 , Berlin , 14055 , Germany
              </li>
              <li>
                <div>
                  <FiMail />
                </div>{" "}
                contactus@shoeheaven.com
              </li>
              <li>
                <div>
                  <FaPhoneAlt />
                </div>{" "}
                +49 17693119640
              </li>
              <li>
                <div>
                  <FaClock />
                </div>{" "}
                Monday to Saturday: 9:00am to 10:00pm
              </li>
            </ul>
          </div>
        </div>
        <div className="map">
        <iframe
            title="map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2428.348801742192!2d13.253645476543033!3d52.509026437042046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a857245d03952b%3A0x163cd3e6bf361bf1!2sSensburger%20Allee%2030%2C%2014055%20Berlin%2C%20Germany!5e0!3m2!1sen!2sin!4v1738234489793!5m2!1sen!2sin" 
            height="450"
            style={{ border: "0", width: "-webkit-fill-available" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      <ContactForm />
    </>
  );
};

export default ContactPage;
