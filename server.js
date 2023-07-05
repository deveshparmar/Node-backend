const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const cors = require("cors");
const PORT = process.env.PORT || 8080;
const bcrypt = require("bcrypt");

const Laboratory = require("./models/Laboratory");
const Patient = require("./models/Patient");
const { generateToken } = require("./session");
const { default: axios } = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const uri = process.env.MONGO_URL;
const connectToDatabase = () => {
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("Connection Successful");
    })
    .catch((e) => {
      console.log("Connection Failed\n", e);
    });
};
connectToDatabase();

app.get("/", (req, res) => {
  res.send("Hello from API!");
});

app.post("/register", async (req, res) => {
  try {
    const { labId, name, labName, email, password } = req.body;
    console.log("from /Register" + req.body);
    const e = await Laboratory.findOne({ labId: labId });
    if (e) {
      return res
        .status(400)
        .json({ success: false, message: "Laboratory already exists" });
    }

    const lab = new Laboratory({
      labId: labId,
      name: name,
      labName: labName,
      email: email,
      password: password,
    });

    await lab.save().then(() => {
      return res
        .status(201)
        .json({ success: true, message: "Laboratory added successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    // console.log(req);
    const { email, password } = req.body;
    console.log("email:" + email);
    const user = await Laboratory.findOne({ email }).select("+password");
    if (user === null) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid Credentials" });
    } else {
      if (await bcrypt.compare(password, user.password)) {
        return res
          .status(200)
          .json({ success: true, message: "Login Successful", user: user.labId });
      } else {
        return res
          .status(422)
          .json({ success: false, message: "Invalid Credentials" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getUser/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await Laboratory.findOne({ email: email });
    if (user) {
      return res.status(200).json({ success: true, user });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getId/:email", async (req, res) => {
  try {
    const labId = req.params.labId;
    const user = await Laboratory.findOne({ labId: labId });
    if (user) {
      return res.status(200).json({ success: true, user });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/addPatient", async (req, res) => {
  try {
    const {
      firstname,
      middlename,
      lastname,
      email,
      mobileNumber,
      alternate_mobileNumber,
      dob,
      abhaId,
      gender,
    } = req.body;

    const p = await Patient.findOne({ abhaId: abhaId });
    if (p) {
      return res
        .status(400)
        .json({ success: false, message: "Patient already exists" });
    }

    const patient = new Patient({
      firstname: firstname,
      middlename: middlename,
      lastname: lastname,
      email: email,
      mobileNumber: mobileNumber,
      alternate_mobileNumber: alternate_mobileNumber,
      dob: dob,
      abhaId: abhaId,
      gender: gender,
    });

    await patient.save().then(() => {
      return res
        .status(201)
        .json({ success: true, message: "Patient added successfully" });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getPatient/:abhaId", async (req, res) => {
  try {
    const abhaId = req.params.abhaId;
    const patient = await Patient.findOne({ abhaId: abhaId });
    if (patient) {
      return res.status(200).json({ success: true, patient });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getPatients", async (req, res) => {
  try {
    const patients = await Patient.find();
    if (patients) {
      return res.status(200).json({ success: true, patients });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Patients not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


var authToken = ""
let tranID = "";
let X_Token = "";

async function generate_token(){
  authToken = await generateToken()
  console.log("Auth-Token=="+authToken)
  // setTimeout(generate_token, 8*60*1000);
}

generate_token();


app.post("/generate-aadhaar-otp", async (req, res) => {
  try {
    const { aadhaar } = req.body;
    const body = {
      "aadhaar": aadhaar
    }

    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'Accept-Language' : 'en-US',
      'Accept' : '*/*'
    }
    const response = await axios.post("https://healthidsbx.abdm.gov.in/api/v1/registration/aadhaar/generateOtp", body, {headers: headers,timeout: 60000,})
    tranID = response.data.txnId;
    res.status(200).send(response.data.txnId);
    
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
);

app.post("/verify-aadhaar-otp", async (req, res) => {
  try {
    const { otp } = req.body;
    const body = {
      "otp": otp,
      "txnId": tranID
    }
    // const authToken = await generateToken()
  // console.log(authToken)

    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'Accept-Language' : 'en-US',
      'Accept' : '*/*'
    }
    const response = await axios.post("https://healthidsbx.abdm.gov.in/api/v1/registration/aadhaar/verifyOTP",body,{headers: headers,timeout: 60000,}) 
    tranID = response.data.txnId;
    res.status(200).send(response.data.txnId);
    
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
);

app.post("/generate-mobile-otp", async (req, res) => {
  try {
    const { mobile } = req.body;
    const body = {
      "mobile": mobile,
      "txnId" : tranID
    }
    // const authToken = await generateToken()
  // console.log(authToken)

    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'Accept-Language' : 'en-US',
      'Accept' : '*/*'
    }
    const response = await axios.post("https://healthidsbx.abdm.gov.in/api/v1/registration/aadhaar/generateMobileOTP", body, {headers: headers,timeout: 60000,})
    tranID = response.data.txnId;
    res.status(200).send(response.data.txnId);
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
);

app.post("/verify-mobile-otp", async (req, res) => {
  try {
    const { otp } = req.body;
    const body = {
      "otp": otp,
      "txnId": tranID
    }
    // const authToken = await generateToken()
  // console.log(authToken)

    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'Accept-Language' : 'en-US',
      'Accept' : '*/*'
    }
    const response = await axios.post("https://healthidsbx.abdm.gov.in/api/v1/registration/aadhaar/verifyMobileOTP",body,{headers: headers,timeout: 60000,})
    tranID = response.data.txnId;
    res.status(200).send(response.data.txnId);
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
);

app.post("/create-abha", async (req, res) => {
  try {
    const { email, firstName, healthId, lastName, middleName, password } = req.body;
    const body = {
        "email": email,
        "firstName": firstName,
        "healthId": healthId,
        "lastName": lastName,
        "middleName": middleName,
        "password": password,
        "profilePhoto": "",
        "txnId": tranID
    }
    // const authToken = await generateToken()
  // console.log(authToken)

    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'Accept-Language' : 'en-US',
      'Accept' : 'application/json'
    }
    const response = await axios.post("https://healthidsbx.abdm.gov.in/api/v1/registration/aadhaar/createHealthIdWithPreVerified", body, {headers: headers,timeout: 60000,});
    const ResponseData = response.data;
    console.log(ResponseData);
    res.status(200).send(ResponseData);
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
)

app.post("/auth-with-healthid",async (req, res) => {
  try {
    const { healthid } = req.body;
    const body = {
        "healthid": healthid
    }
    // const authToken = await generateToken()
  // console.log(authToken)

    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'Accept-Language' : 'en-US',
      'Accept' : '*/*'
    }
    const response = await axios.post("https://healthidsbx.abdm.gov.in/api/v1/auth/authWithMobile", body, {headers: headers,timeout: 60000,})
    tranID = response.data.txnId;
    console.log(response);
    res.status(200).send(response.data.txnId);
    
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
)

app.post("/login-mobile-otp",async (req, res) => {
  try {
    const { otp } = req.body;
    const body = {
        otp: otp,
        txnId: tranID
    }
    // const authToken = await generateToken()
  // console.log(authToken)

    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'Accept-Language' : 'en-US',
      'Accept' : '*/*'
    }
    const response = await axios.post("https://healthidsbx.abdm.gov.in/api/v1/auth/confirmWithMobileOTP", body, {headers: headers,timeout: 60000,})
    // tranID = response.data.txnId;
    X_Token = response.data.token;
    console.log("\n \n X-Token Print : " + X_Token);
    res.status(200).send({"X-Token" : response.data.token});
    
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
);

app.get("/get-abha-card",async (req, res) => {
  try {
    // const authToken = await generateToken()
  // console.log(authToken)
    console.log("X_Token ==== " + X_Token)
    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'X-Token' : 'Bearer ' + X_Token,
      'Accept-Language' : 'en-US',
      'Accept' : '*/*'
    }
    const response = await axios.get("https://healthidsbx.abdm.gov.in/api/v1/account/getSvgCard",{headers: headers,timeout: 60000,})
    console.log(response);

    const image_data = response.data;
    console.log(image_data)
    res.status(200).json({image_data});
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/get-abha-pdf",async (req, res) => {
  try {
    // const authToken = await generateToken()
  // console.log(authToken)
    console.log("X_Token ==== " + X_Token)
    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'X-Token' : 'Bearer ' + X_Token,
      'Accept-Language' : 'en-US',
      'Accept' : '*/*'
    }
    const response = await axios.get("https://healthidsbx.abdm.gov.in/api/v1/account/getCard",{headers: headers,timeout: 60000,})
    console.log(response);

    const pdf_data = response.data;
    console.log("pdf-data -> " + pdf_data)
    res.status(200).json({pdf_data});
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/logout",async (req, res) => {
  try {
    // const authToken = await generateToken()
  // console.log(authToken)
    console.log("X_Token ==== " + X_Token)
    const headers = {
      'Content-Type' : 'application/json',
      'Authorization' : 'Bearer ' + authToken,
      'X-Token' : 'Bearer ' + X_Token,
      'Accept-Language' : 'en-US',
      'Accept' : '*/*'
    }
    const response = await axios.get("https://healthidsbx.abdm.gov.in/api/v1/account/logout",{headers: headers,timeout: 60000,})
    console.log(response);
    res.sendStatus(response.status)
  }catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
