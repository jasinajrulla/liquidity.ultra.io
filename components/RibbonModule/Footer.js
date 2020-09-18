import React from 'react'
import './style.css'

function Footer({}) {
  return (
    <div>
    <div className="layout-default__footer" data-v-314f53c6="">
            <div className="page-footer bg-theme-secondary-dark" data-v-314f53c6="">
              <div className="container text-center">
                <div className="logotype-wrapper">
                  <a
                    href={`${process.env.WEBSITE_FRONTEND_URL}`}
                    aria-label="Ultra Logotype"
                    ><svg
                      width="45"
                      height="45"
                      viewBox="0 0 45 45"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="logotype-icon"
                    >
                      <path
                        d="M0 22.5C0 14.0885 0 9.88269 1.80866 6.75C2.99353 4.69774 4.69774 2.99353 6.75 1.80866C9.88269 0 14.0885 0 22.5 0C30.9115 0 35.1173 0 38.25 1.80866C40.3023 2.99353 42.0065 4.69774 43.1913 6.75C45 9.88269 45 14.0885 45 22.5C45 30.9115 45 35.1173 43.1913 38.25C42.0065 40.3023 40.3023 42.0065 38.25 43.1913C35.1173 45 30.9115 45 22.5 45C14.0885 45 9.88269 45 6.75 43.1913C4.69774 42.0065 2.99353 40.3023 1.80866 38.25C0 35.1173 0 30.9115 0 22.5Z"
                        fill="#7A52D1"
                      ></path>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.9999 23.0153V14.55H16.1999V23.0813C16.2107 25.2345 16.8352 26.683 17.8685 27.6882C18.927 28.7069 20.3406 29.2962 22.4999 29.2962C24.6639 29.2962 26.0927 28.7043 27.1484 27.6881C28.1729 26.6914 28.7999 25.2274 28.7999 23.0153V14.55H32.9999V23.0153C32.9999 26.0542 32.0991 28.7012 30.0818 30.661C28.0941 32.5764 25.5357 33.45 22.4999 33.45C19.4597 33.45 16.9201 32.5738 14.9351 30.6609C12.9279 28.7111 12.0134 26.018 11.9999 23.0153ZM24.5999 22.8578V14.55H20.3999V22.8809C20.4034 23.6644 20.6116 24.1913 20.9561 24.557C21.3089 24.9274 21.7801 25.1417 22.4999 25.1417C23.2213 25.1417 23.6975 24.9265 24.0494 24.557C24.3909 24.1945 24.5999 23.6622 24.5999 22.8578Z"
                        fill="#ffffff"
                      ></path></svg
                  ></a>
                </div>
                <div className="links-bar">
                  <a href={`${process.env.WEBSITE_FRONTEND_URL}/terms`}>
                    Terms of Use
                  </a>
                  <a href={`${process.env.WEBSITE_FRONTEND_URL}/documents/privacy-policy/recruitment-privacy-policy.pdf`}>
                    Privacy Policy
                  </a>
                  <a href={`${process.env.WEBSITE_FRONTEND_URL}/contact-us`}>
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </div>
    </div>
  )
}

export default Footer
