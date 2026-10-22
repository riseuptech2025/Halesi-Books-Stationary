
 // client/src/pages/About.jsx
export default function About() {
  const values = [
    {
      title: "Our Mission",
      text: "To make books, educational materials, and everyday stationery accessible to students, teachers, professionals, and readers by providing useful products and friendly service.",
      color: "red",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    },
    {
      title: "Our Vision",
      text: "To become a trusted destination for books and stationery in Biratnagar, supporting education, encouraging reading, and helping learners access the resources they need to grow.",
      color: "green",
      icon: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      title: "Our Values",
      text: "We believe in honest business practices, dependable service, quality products, respect for every customer, and the power of education to create better opportunities.",
      color: "yellow",
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    },
  ];

  const services = [
    {
      number: "01",
      title: "Books & Educational Materials",
      description:
        "Explore books and educational resources for students, readers, and people who enjoy learning and discovering new ideas.",
      icon: "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z",
    },
    {
      number: "02",
      title: "Stationery & School Supplies",
      description:
        "Find everyday stationery and essential supplies for classrooms, homework, offices, and creative projects.",
      icon: "M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L9 17l-4 1 1-4Z",
    },
    {
      number: "03",
      title: "Newspapers & Magazines",
      description:
        "Stay connected with reading materials and publications that help customers explore information and keep learning.",
      icon: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
    },
    {
      number: "04",
      title: "General Reading & Supplies",
      description:
        "Discover a selection of reading materials and useful everyday items to support study, work, and personal interests.",
      icon: "M12 3v18 M3 12h18 M5.6 5.6l12.8 12.8 M18.4 5.6L5.6 18.4",
    },
  ];

  const highlights = [
    "Convenient local shopping in Biratnagar",
    "Books and stationery for everyday needs",
    "Friendly, customer-focused service",
    "A commitment to education and reading",
  ];

  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#071f55] text-white">
        <div className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />

        <div className="container-x relative mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Welcome to Halesi Books Centre
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Every Book Opens
              <span className="block text-yellow-400">
                a New Possibility.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-blue-100 md:text-lg">
              Your neighborhood destination for books, stationery, and
              educational essentials. We believe that access to knowledge,
              the joy of reading, and the right learning resources can help
              people build a brighter future.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href="/"
                className="rounded-xl bg-yellow-400 px-7 py-3.5 font-bold text-[#071f55] shadow-lg transition hover:-translate-y-1 hover:bg-yellow-300"
              >
                Explore Our Shop
              </a>

              <a
                href="/contact"
                className="rounded-xl border border-white/30 px-7 py-3.5 font-bold text-white transition hover:bg-white hover:text-[#071f55]"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        <div className="h-1.5 bg-gradient-to-r from-red-600 via-yellow-400 to-teal-700" />
      </section>

      {/* Our Story */}
      <section className="container-x mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-700">
              Who We Are
            </span>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#071f55] md:text-4xl">
              A Local Bookshop with a Passion for Learning
            </h2>

            <div className="mt-5 h-1 w-20 rounded-full bg-yellow-400" />

            <p className="mt-6 leading-8 text-gray-600">
              Halesi Books Centre is a books and stationery business located
              in the Traffic Chowk area of Biratnagar, Morang, Nepal. We serve
              people looking for books, school and office stationery, reading
              materials, and other everyday educational supplies.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              We understand that a book can inspire a student, a notebook
              can support a new idea, and the right learning material can
              make studying easier. That is why we aim to provide a useful
              shopping experience where customers can find the supplies
              they need for school, work, and personal growth.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              As a local business, we value the relationships we build with
              our customers and the community around us. Our goal is to make
              everyday learning resources easier to find while encouraging
              a lasting appreciation for reading and education.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rotate-3 rounded-3xl bg-yellow-400/30" />

            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-red-50 via-yellow-50 to-teal-50 p-8 shadow-xl md:p-12">
              <div className="mx-auto flex max-w-xs flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-md">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-12 w-12 text-[#071f55]"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5.5A2.5 2.5 0 015.5 3H21v17H5.5A2.5 2.5 0 013 17.5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 17.5A2.5 2.5 0 015.5 15H21M8 7h8M8 10h6"
                    />
                  </svg>
                </div>

                <h3 className="mt-7 text-2xl font-extrabold text-[#071f55]">
                  Knowledge for Everyone
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  Helping students prepare, readers discover, and individuals
                  find the tools they need to learn and create.
                </p>

                <div className="mt-7 flex items-center gap-2">
                  <span className="h-2.5 w-10 rounded-full bg-red-600" />
                  <span className="h-2.5 w-10 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-10 rounded-full bg-teal-700" />
                  <span className="h-2.5 w-10 rounded-full bg-[#071f55]" />
                </div>

                <p className="mt-5 text-sm font-bold uppercase tracking-widest text-[#071f55]">
                  Read · Learn · Grow
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container-x mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-700">
              What We Offer
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-[#071f55] md:text-4xl">
              Everything Starts with Learning
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              From reading materials to everyday stationery, we aim to make
              your shopping for learning and work essentials convenient.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.number}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-yellow-300 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-50 text-red-700 transition group-hover:bg-[#071f55] group-hover:text-yellow-300">
                    <svg
                      className="h-7 w-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={service.icon} />
                    </svg>
                  </div>

                  <span className="text-sm font-extrabold text-gray-300">
                    {service.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-extrabold text-[#071f55]">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {service.description}
                </p>

                <div className="mt-5 h-1 w-10 rounded-full bg-yellow-400 transition-all group-hover:w-20" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="container-x mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-700">
            What Guides Us
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-[#071f55] md:text-4xl">
            Our Mission, Vision & Values
          </h2>

          <p className="mt-4 leading-7 text-gray-600">
            The principles behind the way we serve our customers and support
            a community that values knowledge and education.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {values.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-gray-100 bg-white p-7 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  item.color === "red"
                    ? "bg-red-50 text-red-700"
                    : item.color === "green"
                    ? "bg-teal-50 text-teal-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
              </div>

              <h3 className="text-xl font-extrabold text-[#071f55]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#071f55] py-16 text-white md:py-20">
        <div className="container-x mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-400">
              The Halesi Difference
            </span>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
              More Than a Shop.
              <span className="block text-yellow-400">
                A Place for Possibilities.
              </span>
            </h2>

            <p className="mt-5 leading-8 text-blue-100">
              We believe shopping for books and stationery should be simple,
              welcoming, and worthwhile. We strive to help customers find
              practical products for their learning, work, and reading needs.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <ul className="space-y-5">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-[#071f55]">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 12 4 4L19 6"
                      />
                    </svg>
                  </span>

                  <span className="leading-7 text-blue-50">
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="container-x mx-auto px-4 py-16 md:py-20">
        <div className="grid items-center gap-8 rounded-3xl border border-gray-100 bg-gradient-to-br from-red-50 via-white to-yellow-50 p-7 md:grid-cols-2 md:p-12">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-700">
              Find Us
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-[#071f55]">
              Proud to Serve Biratnagar
            </h2>

            <p className="mt-4 leading-8 text-gray-600">
              Visit Halesi Books Centre in the Traffic Chowk area of
              Biratnagar, Morang, Nepal, for books, stationery, and
              educational essentials.
            </p>

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-red-700 shadow-sm">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>

              <div>
                <h3 className="font-bold text-[#071f55]">
                  Our Location
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Traffic Chowk, Biratnagar, Morang, Nepal
                </p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Traffic+Chowk%2C+Biratnagar%2C+Morang%2C+Nepal"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#071f55] px-6 py-3 font-bold text-white transition hover:bg-red-700"
            >
              Get Directions
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 17 17 7M7 7h10v10"
                />
              </svg>
            </a>
          </div>

          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm md:min-h-80">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-50 text-[#071f55]">
              <svg
                className="h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"
                />
              </svg>
            </div>

            <h3 className="mt-5 text-2xl font-extrabold text-[#071f55]">
              Halesi Books Centre
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-7 text-gray-600">
              Books, stationery, and educational essentials for your
              everyday learning journey.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-teal-700">
              <span className="h-2 w-2 rounded-full bg-teal-600" />
              Read · Learn · Grow
            </div>
          </div>
        </div>
      </section>

      {/* Closing Message */}
      <section className="container-x mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-[#a71919] px-6 py-12 text-center text-white md:px-16 md:py-16">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[25px] border-white/10" />
          <div className="absolute -bottom-24 -left-12 h-56 w-56 rounded-full border-[30px] border-white/10" />

          <div className="relative mx-auto max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-yellow-300">
              A Message from Our Team
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
              Thank You for Being Part of Our Story
            </h2>

            <p className="mt-5 leading-8 text-red-50">
              Every customer who walks through our doors becomes part of
              our journey. Your trust encourages us to keep serving our
              community with dedication and care. Whether you are searching
              for a book, preparing for school, or stocking up on stationery,
              we are happy to be part of your learning journey.
            </p>

            <p className="mt-5 font-bold text-yellow-300">
              Halesi Books Centre — Your Journey to Knowledge Starts Here.
            </p>

            <a
              href="/contact"
              className="mt-8 inline-flex rounded-xl bg-yellow-400 px-7 py-3.5 font-bold text-[#071f55] transition hover:-translate-y-1 hover:bg-yellow-300"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
