import { motion } from 'framer-motion';
import {
  Shield,
  CreditCard,
  Users,
  Layers,
  Zap,
  Database,
  Bell,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Shield,
    title: 'Autenticação Completa',
    description:
      'JWT + Refresh tokens, recuperação de senha, verificação de email. Tudo pronto.',
    highlight: true,
    gradient: 'from-primary/20',
  },
  {
    icon: CreditCard,
    title: 'Billing com Stripe',
    description:
      'Checkout, portal do cliente, webhooks, planos e assinaturas configurados.',
    highlight: true,
    gradient: 'from-secondary/20',
  },
  {
    icon: Users,
    title: 'Multi-tenancy',
    description:
      'Workspaces isolados, convites por email, roles (owner/admin/member).',
    highlight: false,
  },
  {
    icon: Layers,
    title: 'Clean Architecture',
    description: 'CQRS, Repository pattern, DI. Código organizado e escalável.',
    highlight: false,
  },
  {
    icon: Zap,
    title: 'Background Jobs',
    description:
      'BullMQ + Redis para processamento assíncrono. Emails, webhooks, auditing.',
    highlight: false,
  },
  {
    icon: Database,
    title: 'Kysely Type-Safe',
    description:
      'Query builder com TypeScript. Migrations com Knex. Zero SQL injection.',
    highlight: false,
  },
  {
    icon: Bell,
    title: 'Webhooks',
    description:
      'Receba eventos externos com retry automático e logging completo.',
    highlight: false,
  },
  {
    icon: GitBranch,
    title: 'Deploy Ready',
    description: 'Railway (backend) + Cloudflare Pages (frontend). CI/CD automático.',
    highlight: false,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-primary font-medium mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            O que está incluso
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Tudo que você precisa para{' '}
            <span className="text-primary">lançar rápido</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Semanas de desenvolvimento economizadas. Foque no que importa: seu produto.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className={
                feature.highlight
                  ? 'md:col-span-2'
                  : ''
              }
            >
              <Card
                className={`h-full group hover:border-primary/50 transition-all duration-300 ${
                  feature.highlight
                    ? `bg-gradient-to-br ${feature.gradient} to-transparent`
                    : ''
                }`}
              >
                <CardHeader>
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${
                      feature.highlight
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    }`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className={feature.highlight ? 'text-2xl' : ''}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-muted-foreground ${
                      feature.highlight ? 'text-base' : 'text-sm'
                    }`}
                  >
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech stack */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground mb-6">Stack tecnológica</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'NestJS',
              'React',
              'TypeScript',
              'PostgreSQL',
              'Redis',
              'Stripe',
              'Tailwind',
              'Shadcn/ui',
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full bg-muted text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
