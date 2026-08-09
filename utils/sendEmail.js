const sendEmail = async (opts) => {
    try {
        const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim()

        if(!BREVO_API_KEY) {
            console.error("Missing BREVO_API_KEY in the .env file");
            throw new Error("Missing Email API Key");
        }

        const data = {
            sender: {
                name: "ApexRoot Platform",
                email: process.env.EMAIL_USER
            },
            to: [{ email: opts.email}],
            subject: opts.subject,
            htmlContent: opts.message
        };

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Email sent successfully via Brevo: ", result.messageId);
        } else {
            console.error("Brevo API Key Error:", result);
            throw new Error(result.message || "Could not send email via Brevo");
        }

    } catch (error) {
        console.error("Brevo Email Error:", error);
        throw new Error(result.message || "Could not send email via Brevo");
    }
}

export default sendEmail