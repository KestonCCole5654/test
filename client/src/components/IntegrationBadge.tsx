"use client"

const integrations = [
  {
    src: "/google-sheets.svg",
    alt: "Google Sheets",
    name: "Sheets",
    bgColor: "bg-green-50",
  },
  {
    src: "/google-drive.svg",
    alt: "Google Drive",
    name: "Drive",
    bgColor: "bg-blue-50",
  },
  {
    src: "/make-logo.svg",
    alt: "Make",
    name: "Make",
    bgColor: "bg-purple-50",
  },
  {
    src: "/mailgun-seeklogo.svg",
    alt: "WhatsApp",
    name: "WhatsApp",
    bgColor: "bg-green-50",
  },
]

const IntegrationBadge = () => {
  return (
    <div className="flex items-center justify-center mb-8 w-full">
      <div className="relative group">
        {/* Main badge container */}
        <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-2xl transition-all duration-300 px-6 shadow-none py-4 border border-gray-100/50 group-hover:border-gray-200/80">
          {/* Logo section with enhanced visibility */}
          <div className="flex items-center space-x-1 mr-6">
            <div className="flex -space-x-2">
              {integrations.map((integration, index) => (
                <div
                  key={index}
                  className={`relative w-12 h-12 rounded-xl ${integration.bgColor} border-2 border-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 hover:-translate-y-1 flex items-center justify-center group/logo`}
                  style={{
                    zIndex: integrations.length - index,
                  }}
                >
                  <img
                    src={integration.src || "/placeholder.svg?height=24&width=24"}
                    alt={integration.alt}
                    className="w-7 h-7 transition-transform duration-200 group-hover/logo:scale-110"
                  />

                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {integration.name}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Text section with better typography */}
          <div className="flex flex-col items-start">
            <span className="text-gray-900 font-bold text-sm md:text-lg leading-tight">3+ Integrations</span>
            <span className="text-gray-500 font-medium md:text-sm text-xs ">Built for Google Sheets</span>
          </div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r   from-green-400/10 via-blue-400/10 to-purple-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
      </div>
    </div>
  )
}

export default IntegrationBadge 