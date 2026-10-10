import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import backgroundImage from "../assets/images/bg.jpg";
import Spinner from "../components/spinner/LoadingSpinner";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [loading2, setLoading2] = useState(false);

  const { loading, error, dispatch } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      Swal.fire("Please enter your email and password", "", "error");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      Swal.fire("Please enter a valid email address", "", "error");
      return;
    }
    dispatch({ type: "LOGIN_START" });
    setLoading2(true);
    try {
      const res = await axios.post("auth/login", credentials);
      const signedInUser = { ...res.data.details, isAdmin: res.data.isAdmin === true };
      dispatch({ type: "LOGIN_SUCCESS", payload: signedInUser });
      if (res.data.isAdmin === true) navigate("/admin");
      else if (signedInUser.type === "financeManager") navigate("/finance");
      else navigate(location.state?.from || "/");
    } catch (err) {
      const data = err.response?.data || {};
      dispatch({ type: "LOGIN_FAILURE", payload: data.message || "Unable to sign in" });
      if (data.code === "EMAIL_NOT_VERIFIED") {
        await Swal.fire("Verify your email", data.message, "info");
        navigate("/verify-email?email=" + encodeURIComponent(credentials.email));
      } else {
        Swal.fire("Unable to sign in", data.message || "Check your details and try again.", "error");
      }
    } finally {
      setLoading2(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="py-32 lg:py-32">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="relative mx-auto mt-[-5rem] max-w-[525px] overflow-hidden bg-transparent py-16 px-10 text-center sm:px-12 md:px-[60px]">
                <div className="mb-10 text-center md:mb-16">
                  <h2 className="text-5xl font-bold">LOGIN</h2>
                </div>
                <form>
                  <div className="mb-6">
                    <input
                      type="email"
                      placeholder="Email"
                      id="email"
                      name="email"
                      onChange={handleChange}
                      className="bordder-[#E9EDF4] w-full rounded-3xl focus:ring border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                    />
                  </div>
                  <div className="mb-9">
                    <input
                      type="password"
                      placeholder="Password"
                      id="password"
                      name="password"
                      onChange={handleChange}
                      className="bordder-[#E9EDF4] w-full rounded-3xl border focus:ring bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                    />
                  </div>
                  <div className="mb-10">
                    <button
                      disabled={loading}
                      onClick={handleClick}
                      className="w-full cursor-pointer rounded-3xl font-bold bg-[#41A4FF] text-center hover:bg-gray-600 py-3 px-5 text-white transition hover:bg-opacity-90"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
                {loading && <Spinner />}

                <Link
                  to="/reset-password"
                  className="mb-2 inline-block text-base text-red-500 font-semibold cursor-pointer hover:text-primary hover:underline"
                >
                  Forget Password?
                </Link>
                <p className="text-base text-[#adadad]">
                  Not a member yet?
                  <Link
                    to="/register"
                    className="text-primary cursor-pointer hover:underline ms-2 font-bold"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
