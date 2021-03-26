### Implementing B2C payment via Mpesa API using Node.js

Mpesa is a mobile phone-based banking service. Since its inauguration in 2007 by Vodafone Group PLC and Safaricom in Kenya, it has expanded to eight more countries in Africa.

Mpesa API (Application Programming Interface) enables software developers to be able to intergrate different functionalities provided by Mpesa in to their applications.

### Goals

In this article, we will implement B2C payment functionality from Mpesa API on a Node.js restful API.

### Prerequisites

To follow along in this article, it is helpful to have the following:

- [Node.js](https://nodejs.org/en/) installed on your computer.

- [Postman](https://www.postman.com/) installed on your computer.

- Some basic knowledge working with JavaScript.

- Some basic knowledge working with [Express.js](https://expressjs.com/)

- Your favourite text editor installed.

### Overview

- [Setting-up-the-development-server](#setting-up-the-development-server)

- [Getting an access token](#getting-an-access-token)

- [Implementing B2C payments](#implementing-b2c-payments)

- [Implementing C2B payments](#implementing-c2b-payments)

### Setting up the development server

This article assumes that you have a Safaricom developer account. If you dont, go through this [steps](https://www.section.io/engineering-education/lipa-na-mpesa-online/#creating-a-safaricom-developer-account). Also, ensure that you have created atleast one application from your developer portal. If you don't have any, follow this [guidelines](https://www.section.io/engineering-education/lipa-na-mpesa-online/#creating-an-app).

With an account, and an application in your developer portal, clone this [Github repository](https://github.com/mwangiKibui/mpesa-business-API-s). The repository has everything set and our role through out the article is to implement the core functionalities.

To start with, install the dependencies by running the following command from the terminal of your text editor:

```bash
npm install
```

The dependencies are as follows:

- [axios](https://www.npmjs.com/package/axios): For handling the requests to the Mpesa API.

- [dotenv](https://www.npmjs.com/package/dotenv): For loading the environmental variables.

- [express](https://www.npmjs.com/package/express): For providing a faster, and easier to work with set up for the restful API.

- [ngrok](https://www.npmjs.com/package/ngrok): For exposing our localhost server.

Having installed the dependencies, you need to get your `CONSUMER_SECRET` and `CONSUMER_KEY`. To do that, follow the following steps:

- From your [applications page](https://developer.safaricom.co.ke/user/me/apps), select your app.

- From the keys section, copy the `Consumer Key` and the `Consumer Secret` and paste them appropriately in your `.env` file at the root of the project folder. With that, you are set for the next step.

Henceforth, we will be working on the `src/controllers/Mpesa.js` file.

### Getting an access token

An access token is required for every method you call to the Mpesa API. It forms the basis for authentication.

Since the access token will be needed in every call we make, we will implement it as a middleware. This means that it won't return anything but call the next function on the line. Express.js supports this.

To implement the functionality, modify `getAccessToken()` method as follows:

```javascript
async getAccessToken(req,res,next){

    let consumer_key = process.env.CONSUMER_KEY;
    let consumer_secret = process.env.CONSUMER_SECRET;
    let url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    let buf = new Buffer.from(`${consumer_key}:${consumer_secret}`).toString("base64");
    let auth = `Basic ${buf}`;

    let response = await axios.default.get(url,{
        headers:{
            "Authorization":auth
        }
    }).catch(console.log);

    //set access-token.
    req.access_token = response.data.access_token;

    return next();

};
```

From above:

- Get the consumer key and the consumer secret from the environment variables.

- Get the url to send the url to.

- Generate a buffer from the consumer key and consumer secret and then encode it to a `base64` string.

- Compose the authentication string by appending `Basic` before the encoded string.

- Send the request to Mpesa API.

- Set the access token returned to the request object.

- Call the next function on the line.

### Implementing B2C payments

B2C payments are payments from a business to a customer. With the Mpesa API, a merchant can automate payment to customers from their business accounts.

The least a business can transact is fifty kenyan shillings and the maximum is one hundred and fifty thousand kenyan shillings.

Modify the `b2c()` method as follows:

```javascript
async b2c(req,res,next){

    let access_token = req.access_token;
    let url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";
    let ngrok_url = process.env.NGROK_URL;
    let auth = `Bearer ${access_token}`;

    let response = await axios.default.post(url,{
        "InitiatorName": "your_inititor_name",
        "SecurityCredential":"your_security_credential",
        "CommandID": "your_command_id",
        "Amount": "50",
        "PartyA": "your_mpesa_shortcode",
        "PartyB": "your_test_phone_number",
        "Remarks": "your_remark",
        "QueueTimeOutURL": `${ngrok_url}/timeout`,
        "ResultURL": `${ngrok_url}/cb`,
        "Occasion": "your_occasion"
    },{
        headers:{
            "Authorization":auth
        }
    }).catch(console.log);

    return res.send({
        result:response.data
    });

};
```

From above:

- Get the access token from the request object.

- Set the url to send the request to.

- Set the ngrok url. To get it, ensure that you have [ngrok](https://ngrok.com/) installed. With ngrok installed, open the terminal of your text editor run the following command to start your development server:

```bash
npm run dev
```

With the development server started, open a separate tab and run the following command to expose your development server:

```bash
npm run ngrok
```

Copy the HTTPS URL logged in your terminal and paste it appropriately in the `.env` file on the root of your project folder.

- Set the authentication token by appending `Bearer` before the access token.

- Set the following data in the body of the `POST` request:

  - InitiatorName: From your [test credentials](https://developer.safaricom.co.ke/test_credentials), copy the `Initiator Name` and paste it as the value.

  - SecurityCredential: From your [test credentials](https://developer.safaricom.co.ke/test_credentials) page, copy the `Security Credential`, input it in the `Initiator Security Password` form and then click `Generate Credentials`. Copy the long text and paste it as the value for `SecurityCredential`.

  - CommandID: Transaction specific command. Avoid whitespace for the value and use `camel case` syntax. For example, you can set it to , `SalaryPayment`, `CommissionPayment`. Ensure you keep your value short.

  - Amount: Any amount greater than fifty and not more than one hundred and fifty thousand.

  - PartyA: Your Mpesa shortcode. You can get it from your [test credentials](https://developer.safaricom.co.ke/test_credentials), as `ShortCode 1`.

  - PartyB: The phone number to send money to. Since we are in the sandbox environment, copy the `Test MSIDN` from your [test credentials](https://developer.safaricom.co.ke/test_credentials).

  - Remarks: Any Comment to send along with the transaction. Make sure that it is not too long.

  - Occasion: An Optional comment to send along with the transaction. Make it short also.

  - QueueTimeOutURL: The URL to be called in case of a time out. For accessibility, we will use the exposed URL. The logic behind the `timeOut()` method will be as follows:

  ```javascript
  async timeOut(req,res,next){

        console.log("--- request timeout ----");

        console.dir(req.body);

        console.log("--- end of request timeout ---");
  };
  ```

  - ResultURL: The URL that will be called if the process is successful. For accessiblity, we will use the exposed URL. The logic behind the `cb()` method will be as follows:

  ```javascript
  async cb(req,res,next){

        console.log("--- callback request ----");

        let response = req.body.Result;

        if(response.ResultParameters) {

            response.ResultParameters = response.ResultParameters.ResultParameter;

        }

        if(response.ReferenceData) {

            response.ReferenceData = response.ReferenceData.ReferenceItem;

        };

        console.log(response)

        console.log("--- end of callback request ---");

    };
  ```

  - Occasion: Any description you prefer. Keep the value as short.

- After setting the data, ensure that your development server is up and running from your terminal.

- Open postman and send a `POST` request to `http://localhost:4000/b2c`. If you receive an error, revisit the steps.

Else the response from postman should resemble the following:

![b2c_postman_response](b2c-postman-response.jpg)

The following should resemble the information logged on your console after the callback is executed:

![b2c_console_response](b2c-console-response.jpg)

### Summary

In this artilcle, we have implemented b2c payment functionality from Mpesa API to a Node.js restful API. You can be access the finalized code from [here]().

### Conclusion

Automating the process of disbursing payments to customers is a vital step towards achieving the business goals. You can learn more on b2c from [here](https://www.safaricom.co.ke/faqs/faq/606).

In case of any query or concern, feel free to reach me via [Twitter](https://twitter.com/home).

Happy coding!!
