# ShoeHeaven

Welcome to ShoeHeaven – where fashion meets comfort! ShoeHeaven is a cutting-edge e-commerce platform built on the robust MERN stack (MongoDB, Express.js, React.js, Node.js). Our platform offers a seamless shopping experience, allowing customers to explore and purchase a wide variety of stylish and comfortable shoes.

For administrators, ShoeHeaven provides a powerful management dashboard to oversee products, orders, and user accounts. We prioritize secure transactions, with payments powered by Razorpay to ensure a hassle-free checkout process.

Discover your perfect pair at ShoeHeaven today!

![ShoeHeaven Landing Page](https://github.com/user-attachments/assets/8c79bb87-d324-41b0-9700-a4aaabc9d1ad)


## Features

- **Responsive Design:** Enjoy a seamless and consistent shopping experience across all devices, from desktops to tablets and smartphones.  

- **Product Catalog and Search:** Easily browse through a diverse collection of shoes, with options to filter by categories, sizes, brands, and more for precise results.  

- **Cart Management:** Effortlessly add products to your cart, adjust quantities, remove items, and apply discount coupons for an enhanced shopping experience.  

- **Secure Payment Integration:** Experience smooth and secure transactions with the Razorpay payment gateway, ensuring a hassle-free checkout process.  

- **User Authentication and Authorization:** Safeguard user data with secure authentication and resource management through JSON Web Tokens (JWT).  

- **Admin Dashboard:** Gain access to an intuitive admin panel for efficient management of products, orders, users, and insightful business statistics.  

- **Order Management:** View and track past purchases with detailed order history, simplifying reordering and reference.  

- **Product Reviews and Information:** Make confident purchase decisions with comprehensive product details and authentic customer reviews.  

- **Email Notifications:** Keep users informed with automated emails for order confirmations, shipping updates, and exclusive promotions.  

- **Password Recovery:** Enable users to conveniently reset forgotten passwords, ensuring uninterrupted access to their accounts.  


## Technologies Used  

- **React.js:** A powerful frontend library for building dynamic and interactive user interfaces.  

- **Node.js:** A runtime environment that allows server-side execution of JavaScript.  

- **Express.js:** A lightweight backend framework used for managing HTTP requests and routing.  

- **MongoDB:** A NoSQL database for efficiently storing user data, product information, and order details.  

- **JWT (JSON Web Tokens):** Ensures secure user authentication and role-based access control.  

- **Axios:** A promise-based HTTP client for seamless communication between the frontend and backend.  

- **Razorpay:** A reliable and secure payment gateway for processing online transactions smoothly.  


## Demo  

Experience the ShoeHeaven platform here: [ShoeHeaven](https://shoeheaven.vercel.app)  

To explore the platform as a demo user, visit the [User Login](https://shoeheaven.vercel.app/login) page and use the following credentials:  

```plaintext  
Email: test01@gmail.com  
Password: Test@01  
```

You can access the admin section by navigating to [Admin Login](https://shoeheaven.vercel.app/adminlogin) and using the following credentials:

```plaintext
Email: adityagermany798@gmail.com  
Password: Aditya@798  
```
Discover the ease and functionality of ShoeHeaven today!

## Installation Guide  

Follow these steps to set up **ShoeHeaven** on your local machine for both frontend and backend.  

---

### **Frontend Setup**  

1. **Clone the Repository:**  

```bash  
git clone https://github.com/shrishail356/shoeHeavenFrontend.git  
```  

2. **Navigate to the Project Directory:**  

```bash  
cd shoeHeavenFrontend  
```  

3. **Install Dependencies:**  

```bash  
npm install  
```  

4. **Set up Environment Variables:**  

   Create a `.env` file in the root directory and define the following variables:  

```plaintext  
VITE_BACKEND_URL=  
# Backend Deployed link (append /api/v1 to the link)  
# Default value: http://localhost:3000/api/v1  

VITE_REACT_APP_REMOVEBG_KEY=  
# REMOVE_BG API KEY  
# Obtain from: https://www.remove.bg/dashboard#api-key  
# Guide: https://drive.google.com/file/d/1eZkkPG8sw64GF0_ZdkHoKatmwwDLcjkf/view?usp=sharing  

VITE_RAZORPAY_KEY_ID=  
# Get it from: https://dashboard.razorpay.com/  
# Use test mode, not live mode  
# Guide: https://www.youtube.com/watch?v=6mJnOWZDhDo  
```  

5. **Run the Frontend Server:**  

```bash  
npm run dev  
```  

   The frontend will now be accessible at [http://localhost:5173](http://localhost:5173).  

---

### **Backend Setup**  

1. **Clone the Repository:**  

```bash  
git clone https://github.com/shrishail356/shoeHeavenBackend.git  
``` 

2. **Navigate to the Project Directory:**  

```bash  
cd shoeHeavenBackend  
```  

3. **Install Dependencies:**  

```bash  
npm install  
```  

4. **Set up Environment Variables:**  

   Create a `.env` file in the root directory and define the following variables:  

```plaintext  
PORT=  
# Preferred value: 3000  

MONGO_URI=  
# Obtain from: https://cloud.mongodb.com  
# Guide: https://www.youtube.com/watch?v=SMXbGrKe5gM  

SMTP_EMAIL=  
# Your email address  

SMTP_PASSWORD=  
# Google Account App Password  
# Guide: https://drive.google.com/file/d/1MgmAOOJXefFTx-n2uxkO3fZAayKa_RHS/view?usp=sharing  
# Important: Do not delete the generated app password.  

JWT_SECRET=  
# Any random text can be used  

CLIENT_URL=http://localhost:5173  
# Frontend URL when using Vite  

RAZORPAY_KEY_ID=  
RAZORPAY_KEY_SECRET=  
RAZORPAY_WEBHOOK_SECRET=  
# Obtain Razorpay credentials from: https://dashboard.razorpay.com  
# Guide: https://www.youtube.com/watch?v=6mJnOWZDhDo  
```  

5. **Run the Backend Server:**  

```bash  
   nodemon app.js  
```  

   The backend will now run at [http://localhost:3000](http://localhost:3000).  

---

By following these steps, you'll have both the frontend and backend running locally for the ShoeHeaven project. Happy coding!  
