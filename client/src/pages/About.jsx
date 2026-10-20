// client/src/pages/About.jsx
export default function About() {
  return (
    <div className="container-x py-16 animate-fade-in">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-red-700">
          About Us
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 font-display">
          Our <span className="text-green-700">Story</span>
        </h1>
        <p className="text-gray-600 mt-4 text-lg">
          Serving readers in Halesi with quality books, stationery, and
          personalized service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            title: "Our Mission",
            text: "To make quality books accessible to every reader in Halesi — from students to lifelong learners.",
            color: "red",
            icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
          },
          {
            title: "Our Vision",
            text: "To be the most trusted bookstore in the region — known for our curated selection and warm service.",
            color: "green",
            icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
          },
          {
            title: "Our Values",
            text: "Integrity, community, and a genuine love for books. Every customer matters to us.",
            color: "yellow",
            icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-t-yellow-400 hover:shadow-xl transition"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                c.color === "red"
                  ? "bg-red-100 text-red-600"
                  : c.color === "green"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={c.icon}
                />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              {c.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4 font-display text-center">
          A Message from Our Team
        </h2>
        <p className="text-gray-700 leading-relaxed text-center">
          Since opening our doors, Halesi Books Centre has been more than a
          shop — it's a gathering place for readers, students, and anyone who
          loves the smell of a new book. We handpick every title in our
          collection and are always happy to help you find the perfect read.
        </p>
      </div>
    </div>
  );
}