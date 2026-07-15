# FinRelief AI – AI-Powered Debt Relief & Financial Recovery Platform

live demo : FinRelief AI – Debt Relief Platform https://share.google/D8jvqskkJqUxiEDyY

## Conclusion

FinRelief AI is an AI-powered web application developed to simplify debt management and financial recovery through intelligent financial analysis and automated negotiation support. The platform combines modern full-stack technologies with AI-assisted decision making to help borrowers better understand their financial position and negotiate loan settlements more effectively.

The project follows a modular architecture using React.js and Vite for the frontend and FastAPI with Python for the backend. SQLite is used for persistent data storage, while Google Gemini API integration enables AI-powered negotiation strategy generation with rule-based fallback mechanisms for improved reliability.

The platform provides several important features, including:

- User registration and secure authentication
- Financial health analysis
- Debt and EMI calculations
- Settlement prediction based on borrower profile
- AI-generated negotiation strategies
- Professional negotiation letter generation
- Borrower rights and financial guidance
- Loan history management
- Responsive modern user interface

Throughout the development process, emphasis was placed on modular architecture, secure authentication, structured database design, REST API communication, and maintainable source code organization. The project also incorporates exception handling, validation mechanisms, and scalable folder organization to support future enhancements.

FinRelief AI demonstrates how Artificial Intelligence can improve financial decision making by reducing manual effort, providing personalized recommendations, and assisting borrowers during debt settlement negotiations.

Future enhancements may include:

- Multiple lender integrations
- Credit score analysis
- Payment gateway integration
- Email and SMS notifications
- OCR-based document upload
- Cloud deployment
- Advanced AI financial planning
- Analytics dashboard for financial institutions

Overall, FinRelief AI provides a scalable foundation for AI-driven financial recovery systems and demonstrates the practical application of full-stack development, REST APIs, database management, authentication, and Generative AI technologies within the financial domain.

## Environment Variables

To run the project or deploy to production, ensure the following environment variables are set:

### Frontend (.env or Vercel Environment Variables)
- `VITE_API_BASE_URL`: The URL of your deployed backend (e.g. `https://finrelief-backend.onrender.com`). If not set, it will fallback to `http://localhost:8000` for local development.

### Backend (.env or Render Environment Variables)
- `DATABASE_URL`: The connection string for the database. By default, it is `sqlite:///./finrelief.db`. On Render, this is mapped to `sqlite:////data/finrelief.db` for persistence.
- `SECRET_KEY`: A secure string used for signing JWT authentication tokens.
- `GEMINI_API_KEY`: Your Google Gemini API Key used for AI-driven negotiation strategies.
