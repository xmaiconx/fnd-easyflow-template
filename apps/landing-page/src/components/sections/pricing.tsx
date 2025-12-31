import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'QuickLaunch',
    description: 'Para quem quer começar',
    price: 'Incluído na FND',
    features: [
      'Template completo',
      'Auth + Billing + Multi-tenancy',
      'Clean Architecture',
      'Documentação completa',
      'Atualizações por 1 ano',
    ],
    cta: 'Entrar na FND',
    highlighted: false,
  },
  {
    name: 'FND Completo',
    description: 'Template + Método + Comunidade',
    price: 'Consulte',
    features: [
      'Tudo do QuickLaunch',
      'SalesFlow (máquina de vendas)',
      'Comunidade exclusiva',
      'Mentorias ao vivo',
      'Suporte prioritário',
      'Atualizações vitalícias',
      'Cases e templates extras',
    ],
    cta: 'Falar com a equipe',
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-primary font-medium mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Investimento
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Quanto custa{' '}
            <span className="text-primary">meses de trabalho</span>?
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            O QuickLaunch faz parte do ecossistema FND. Você não compra só um template,
            você entra numa fábrica completa.
          </motion.p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'relative h-full flex flex-col',
                  plan.highlighted && 'border-primary shadow-lg shadow-primary/10'
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recomendado
                  </Badge>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Value proposition */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-8 flex-wrap justify-center text-muted-foreground text-sm">
            <span>✓ Economize +3 meses de desenvolvimento</span>
            <span>✓ Arquitetura validada em produção</span>
            <span>✓ Suporte da comunidade FND</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
