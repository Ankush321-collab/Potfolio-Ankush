import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Connect</h4>
            <p>
              <a
                href="mailto:ankushadhikari321@gmail.com"
                target="_blank"
                rel="noreferrer"
                data-cursor="disable"
              >
                ankushadhikari321@gmail.com
              </a>
            </p>
            <p>
              <a href="tel:+918688529112" data-cursor="disable">
                +91-8688529112
              </a>
            </p>
            <p>Kathmandu, Nepal</p>
            <h4>Education</h4>
            <p>
              B.Tech Computer Science and Engineering, SRM University AP —
              2023-2027 (CGPA: 8.81/10)
            </p>
            <p>
              Higher Secondary Education (PCM), Trinity International College —
              2020-2023
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href="https://github.com/Ankush321-collab"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              GitHub <MdArrowOutward />
            </a>
            <a
              href="https://www.linkedin.com/in/ankush-adhikari-000368305/"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              LinkedIn <MdArrowOutward />
            </a>
            <a
              href="https://leetcode.com/u/ankushadhikari321/"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              LeetCode <MdArrowOutward />
            </a>
            <a
              href="https://www.geeksforgeeks.org/user/ankushadh7k3e/"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              GeeksforGeeks <MdArrowOutward />
            </a>
            <a
              href="https://www.codechef.com/users/ankushadhikari"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              CodeChef <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>Ankush Adhikari</span>
            </h2>
            <h4>Highlights</h4>
            <p>Solved 600+ coding problems across major platforms.</p>
            <p>
              Top 3 in MSc Hackathon: 
              <a
                href="https://drive.google.com/file/d/1a8uco14O7H1GNWdM7wUM0p4VnL5Mh8aR/view?usp=drive_link"
                target="_blank"
                rel="noreferrer"
                data-cursor="disable"
              >
                View Certificate
              </a>
            </p>
            <h4>Certifications</h4>
            <p>
              <a
                href="https://drive.google.com/file/d/1WhpQQC3vDqHdYtXk7JXThjVJMB0At2vO/view?usp=drive_link"
                target="_blank"
                rel="noreferrer"
                data-cursor="disable"
              >
                Oracle Generative AI
              </a>
            </p>
            <p>
              <a
                href="https://drive.google.com/file/d/1CNDCMmGsFn4rWyGbvAgBOquS-Bmv4FMV/view?usp=drive_link"
                target="_blank"
                rel="noreferrer"
                data-cursor="disable"
              >
                Machine Learning Using Python
              </a>
            </p>
            <h5>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
