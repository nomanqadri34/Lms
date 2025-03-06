import React, { useEffect } from "react";
import Layout from "../../Layout/Layout";
import { BiRupee } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  getRazorPayId,
  purchaseCourseBundle,
  verifyUserPayment,
} from "../../Redux/razorpaySlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const razorPayKey = useSelector((state) => state.razorpay.key);
  const subscription_id = useSelector((state) => state.razorpay.subscription_id);
  const userData = useSelector((state) => state.auth.data);
  // eslint-disable-next-line
  const isPaymentVerified = useSelector((state) => state.razorpay.isPaymentVerified);

  const handleSubscription = async (event) => {
    event.preventDefault();

    if (!razorPayKey || !subscription_id) {
      toast.error("Payment details are missing.");
      return;
    }

    const paymentDetails = {
      razorpay_payment_id: "",
      razorpay_subscription_id: "",
      razorpay_signature: "",
    };

    const options = {
      key:razorPayKey,
      subscription_id,
      name: "Coursify Pvt. Ltd.",
      description: "Monthly Subscription",
      async handler(response) {
        try {
          paymentDetails.razorpay_payment_id = response.razorpay_payment_id;
          paymentDetails.razorpay_subscription_id = response.razorpay_subscription_id;
          paymentDetails.razorpay_signature = response.razorpay_signature;

          toast.success("Payment Successful");

          const res = await dispatch(verifyUserPayment(paymentDetails));

          if (res?.payload?.success) {
            navigate("/checkout/success");
          } else {
            navigate("/checkout/fail");
          }
        } catch (error) {
          toast.error("Payment verification failed.");
          navigate("/checkout/fail");
        }
      },
      prefill: {
        name: userData?.fullName || "User",
        email: userData?.email || "user@example.com",
      },
      theme: {
        color: "#F37254",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getRazorPayId());
        await dispatch(purchaseCourseBundle());
      } catch (error) {
        toast.error("Failed to fetch payment details.");
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <Layout>
      <form onSubmit={handleSubscription} className="min-h-[90vh] flex items-center justify-center text-white">
        <div className="w-80 h-[26rem] flex flex-col justify-center shadow-[0_0_10px_black] rounded-lg relative">
          <h1 className="bg-yellow-500 absolute top-0 w-full text-center py-4 text-2xl font-bold rounded-tl-lg rounded-tr-lg">
            Subscription Bundle
          </h1>

          <div className="px-4 space-y-5 text-center">
            <p className="text-[17px]">
              This purchase will allow you to access all the available courses for{" "}
              <span className="text-yellow-500 font-bold">1 Year</span>. <br />
              All the existing and newly launched courses will be available in this subscription bundle.
            </p>

            <p className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
              <BiRupee /> <span>1</span> only
            </p>

            <div className="text-gray-200">
              <p>100% refund on cancellation</p>
              <p>* Terms & Conditions Apply</p>
            </div>
          </div>

          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 absolute bottom-0 w-full text-center py-2 text-xl font-bold rounded-bl-lg rounded-br-lg"
          >
            Buy Now
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default Checkout;

