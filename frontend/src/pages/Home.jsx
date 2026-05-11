import HeroSection from '../components/HeroSection'
import FeatureCard from '../components/FeatureCard'
import { AiOutlineRobot, AiOutlineHeart } from 'react-icons/ai'
import { BiPulse } from 'react-icons/bi'
import { MdOutlineFastfood, MdOutlineMonitorHeart } from 'react-icons/md'
import { GiMeal } from 'react-icons/gi'

const featureData = [
  {
    icon: AiOutlineRobot,
    title: 'AI Chatbot',
    description: 'Talk to a smart health assistant for diet suggestions and wellness advice.',
  },
  {
    icon: BiPulse,
    title: 'BMI Calculator',
    description: 'Track your body mass index and stay on top of your fitness goals.',
  },
  {
    icon: MdOutlineFastfood,
    title: 'Diet Planner',
    description: 'Create balanced meal plans with physician-inspired nutrition guidance.',
  },
  {
    icon: GiMeal,
    title: 'Calorie Tracker',
    description: 'Monitor daily calorie intake with an intuitive dashboard overview.',
  },
  {
    icon: AiOutlineHeart,
    title: 'Symptom Checker',
    description: 'Check common symptoms and get proactive wellness recommendations.',
  },
  {
    icon: MdOutlineMonitorHeart,
    title: 'Health Dashboard',
    description: 'Visualize vital metrics and recent activity in a modern layout.',
  },
]

function Home() {
  return (
    <div className="mx-auto max-w-7xl">
      <HeroSection />

      <section id="features" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Features</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Everything you need for smarter healthcare planning.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            An AI-powered healthcare assistant that helps users with symptom guidance, diet suggestions, health tips, and basic wellness support using Gemini AI.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureData.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
