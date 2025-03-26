import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Heart, Shield, Users, Book } from 'lucide-react';
import Navbar from '../components/Navbar';

const services = [
  {
    icon: Heart,
    title: 'Traditional Funeral Services',
    description: 'Complete funeral arrangements with personalized ceremonies and viewings.',
    price: 'Starting from $2,500'
  },
  {
    icon: Shield,
    title: 'Cremation Services',
    description: 'Dignified cremation options with memorial service possibilities.',
    price: 'Starting from $1,800'
  },
  {
    icon: Users,
    title: 'Memorial Services',
    description: 'Celebration of life ceremonies tailored to your preferences.',
    price: 'Starting from $1,500'
  },
  {
    icon: Book,
    title: 'Pre-Planning Services',
    description: 'Plan ahead to ensure your wishes are honored and reduce family stress.',
    price: 'Consultation free'
  }
];

const testimonials = [
  {
    text: "The compassion and professionalism shown during our difficult time was truly remarkable.",
    author: "Sarah Johnson",
    role: "Family Member"
  },
  {
    text: "They handled everything with such grace and attention to detail. We couldn't have asked for better service.",
    author: "Michael Thompson",
    role: "Client"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative h-[90vh] bg-gradient-to-r from-primary-900 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 container mx-auto px-6 py-32 flex flex-col justify-center items-center text-center h-full">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 animate-fade-up animate-duration-700 animate-delay-300">
            Compassionate Care in Your Time of Need
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-2xl animate-fade-up animate-duration-700 animate-delay-500 text-white/90">
            Providing dignified funeral services with respect, understanding, and professional excellence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animate-duration-700 animate-delay-700">
            <Link
              to="/login"
              className="bg-white text-primary-900 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-300"
            >
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-neutral-50" id="services">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Our Services</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              We provide comprehensive funeral services with dignity and compassion
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <service.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-neutral-600 mb-4">{service.description}</p>
                <p className="text-primary-600 font-semibold">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white" id="about">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-serif mb-8">About Us</h2>
            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              With over 25 years of experience, we provide compassionate and professional funeral services
              to our community. Our dedicated team ensures that every detail is handled with care and respect.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-300"
            >
              Learn more about our history
              <svg className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-24 bg-neutral-50" id="resources">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-serif text-center mb-12">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Funeral Planning Guide</h3>
              <p className="text-neutral-600 mb-4">
                Step-by-step guidance for planning a meaningful funeral service.
              </p>
              <Link to="/resources/planning" className="text-primary-600 hover:text-primary-700">
                Read more →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Grief Support</h3>
              <p className="text-neutral-600 mb-4">
                Resources and support for coping with loss and grief.
              </p>
              <Link to="/resources/grief-support" className="text-primary-600 hover:text-primary-700">
                Read more →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Legal Information</h3>
              <p className="text-neutral-600 mb-4">
                Important legal considerations and documentation requirements.
              </p>
              <Link to="/resources/legal" className="text-primary-600 hover:text-primary-700">
                Read more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white" id="testimonials">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-serif text-center mb-12">What Families Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-neutral-50 p-8 rounded-lg">
                <p className="text-lg italic mb-4">{testimonial.text}</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-neutral-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-primary-900 text-white" id="contact">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-serif text-center mb-16">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">24/7 Support</p>
                    <p className="text-white/80">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p className="text-white/80">info@fhms.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-white/80">123 Compassion Lane, City, State 12345</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">Available 24/7</p>
                    <p className="text-white/80">For emergencies</p>
                  </div>
                </div>
              </div>
            </div>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="sr-only">Your Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-colors duration-300"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Your Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-colors duration-300"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Your Message</label>
                <textarea
                  id="message"
                  placeholder="Your Message"
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-colors duration-300"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-white text-primary-900 py-3 px-6 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-900"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}