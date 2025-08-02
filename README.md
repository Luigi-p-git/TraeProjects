# 🎯 Subscription Tracker

A beautiful, modern subscription management app built with Next.js 14, TypeScript, and Tailwind CSS. Track all your subscriptions in one elegant, easy-to-use interface.

## ✨ Features

- **Beautiful Modern UI** - Clean, responsive design with smooth animations
- **Subscription Management** - Add, edit, and delete subscriptions with ease
- **Visual Dashboard** - See all your subscriptions at a glance with logos and colors
- **Smart Analytics** - Track monthly/yearly costs and upcoming billing dates
- **Search & Filter** - Find subscriptions quickly by name or category
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark Mode Ready** - Built with dark mode support (easily toggleable)

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React & Heroicons
- **Image Optimization**: Next.js Image component

## 🎨 Design Features

- **Glass morphism effects** with backdrop blur
- **Gradient backgrounds** and smooth color transitions
- **Micro-interactions** with hover and click animations
- **Modern card layouts** with subtle shadows and borders
- **Responsive grid system** that adapts to all screen sizes
- **Custom color palette** with CSS variables for easy theming

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd subscription-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
subscription-tracker/
├── app/
│   ├── components/
│   │   ├── SubscriptionCard.tsx    # Individual subscription card
│   │   ├── StatsCard.tsx           # Statistics display cards
│   │   └── AddSubscriptionModal.tsx # Modal for adding subscriptions
│   ├── globals.css                 # Global styles and CSS variables
│   ├── layout.tsx                  # Root layout with navigation
│   └── page.tsx                    # Main dashboard page
├── public/                         # Static assets
├── tailwind.config.ts             # Tailwind CSS configuration
├── next.config.js                 # Next.js configuration
└── package.json                   # Dependencies and scripts
```

## 🎯 Key Components

### SubscriptionCard
- Displays subscription information with logo, price, and billing cycle
- Interactive menu for editing and deleting
- Progress bar showing billing cycle completion
- Hover animations and visual feedback

### StatsCard
- Shows key metrics (monthly total, yearly total, active subscriptions)
- Animated counters and progress indicators
- Color-coded icons and gradients

### AddSubscriptionModal
- Two-step process: select popular service or create custom
- Form validation and error handling
- Preview of selected service
- Smooth animations and transitions

## 🎨 Customization

### Colors
The app uses CSS variables for easy theming. Modify the color palette in `globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... more variables */
}
```

### Adding New Services
To add popular services to the modal, update the `popularServices` array in `AddSubscriptionModal.tsx`:

```typescript
const popularServices = [
  {
    name: 'Your Service',
    logo: 'https://logo.clearbit.com/yourservice.com',
    color: '#FF0000',
    category: 'Category'
  },
  // ... more services
]
```

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 3-4 column grid
- **Large screens**: Up to 4 columns with optimal spacing

## 🚀 Performance Features

- **Next.js Image Optimization** for logos and assets
- **Lazy loading** for better performance
- **Optimized animations** with Framer Motion
- **Efficient re-renders** with React best practices

## 🔮 Future Enhancements

- [ ] Data persistence with local storage or database
- [ ] Export functionality (PDF, CSV)
- [ ] Notification system for upcoming bills
- [ ] Budget tracking and spending insights
- [ ] Integration with banking APIs
- [ ] Multi-currency support
- [ ] Subscription sharing with family/team

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ using Next.js and Tailwind CSS**