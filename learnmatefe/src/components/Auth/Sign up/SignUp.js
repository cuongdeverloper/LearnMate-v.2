import { useEffect, useState } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import "./SignUp.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ImSpinner9 } from "react-icons/im";
import { ApiRegister } from "../ApiAuth";

const SignUp = () => {
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState(null);
  const [role,setRole] = useState('student');
  const [imagePreview, setImagePreview] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    setIsFormValid(username && email && password && phoneNumber && gender);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoadingRegister(true);
  let roleDefault = 'student'
  setRole(roleDefault)
  try {
    const response = await ApiRegister(username, email, password, phoneNumber, gender, role, image);
    setIsLoadingRegister(false);

    if (response?.errorCode === 0) {
      toast.success("Registration successful! Please check your email to verify your account.");
      navigate('/signin'); 
    } else {
      toast.error(response?.message || "Registration failed");
    }
  } catch (error) {
    setIsLoadingRegister(false);
    toast.error("Server error during registration");
  }
};


  useEffect(() => {
    validateForm();
  }, [username, email, password, phoneNumber, gender]);

  return (
    <div className="signup-form-container">
      <form className="signup-form">
        <h2>Sign up</h2>
        <label>
          Full name
          <input
            type="text"
            name="fullName"
            placeholder="Jon Snow"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label>
          Phone Number
          <input
            type="text"
            name="phoneNumber"
            placeholder="0987654321"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            required
          />
        </label>
        <label>
          Gender
          <select
            id="genderForm"
            className="form-control input-field"
            value={gender}
            onChange={(event) => setGender(event.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Profile Image
          <input
            type="file"
            id="imageForm"
            className="form-control input-field"
            onChange={handleImageChange}
            accept="image/*"
          />
        </label>
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Profile Preview" />
          </div>
        )}
        <div className="Register-body-buttonSignUp">
          <button
            type='button'
            className='btn-register btn btn-secondary'
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            {isLoadingRegister && <ImSpinner9 className="loaderIcon" />}
            REGISTER
          </button>
        </div>
        <div className="separator">
          <span>or</span>
        </div>
        <button type="button" className="btn-secondary">
          <FaGoogle /> Sign up with Google
        </button>
        <button type="button" className="btn-secondary">
          <FaFacebook /> Sign up with Facebook
        </button>
        <p className="footer-text">
          Already have an account? <a href="/signin">Sign in</a>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
