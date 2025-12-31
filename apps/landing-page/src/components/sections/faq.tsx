import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Preciso saber programar para usar o QuickLaunch?',
    answer:
      'Sim, o QuickLaunch é voltado para desenvolvedores ou times com conhecimento técnico. Você precisa entender TypeScript, React e conceitos de backend. O template economiza meses de setup, mas você ainda precisa desenvolver as features específicas do seu negócio.',
  },
  {
    question: 'Qual a diferença entre QuickLaunch e outros boilerplates?',
    answer:
      'O QuickLaunch não é só um boilerplate — faz parte do ecossistema FND que inclui metodologia, comunidade e suporte. Além disso, foi construído com arquitetura limpa (Clean Architecture + CQRS), multi-tenancy real (não gambiarras), e integração completa com Stripe que funciona em produção.',
  },
  {
    question: 'Posso usar para projetos comerciais?',
    answer:
      'Sim! O QuickLaunch é licenciado para uso comercial pelos alunos da FND. Você pode criar quantos SaaS quiser com o template. A única restrição é redistribuir o template em si.',
  },
  {
    question: 'E se eu precisar de uma feature que não está no template?',
    answer:
      'A arquitetura do QuickLaunch foi pensada para ser extensível. Seguindo os padrões estabelecidos (CQRS, Repository, etc.), você consegue adicionar qualquer feature. A comunidade FND também compartilha extensões e integrações regularmente.',
  },
  {
    question: 'Quanto tempo economizo usando o QuickLaunch?',
    answer:
      'Em média, alunos reportam economia de 2-4 meses de desenvolvimento. Isso inclui: setup de auth (2-3 semanas), billing com Stripe (2-4 semanas), multi-tenancy (2-3 semanas), infra de background jobs (1-2 semanas), e arquitetura base (2-4 semanas).',
  },
  {
    question: 'O template recebe atualizações?',
    answer:
      'Sim! O QuickLaunch é ativamente mantido. Alunos da FND recebem atualizações conforme novas versões do NestJS, React e outras dependências são lançadas, além de melhorias de segurança e novas features.',
  },
  {
    question: 'Posso usar com outro banco de dados?',
    answer:
      'O template usa PostgreSQL por padrão, que é a melhor escolha para 99% dos SaaS. Porém, como usamos Kysely (query builder), a migração para outro banco SQL é possível com ajustes. NoSQL (MongoDB, etc.) exigiria refatoração mais significativa.',
  },
  {
    question: 'Como funciona o suporte?',
    answer:
      'Alunos FND têm acesso à comunidade exclusiva onde podem tirar dúvidas, compartilhar experiências e receber ajuda de outros alunos e mentores. Issues técnicas específicas do template podem ser reportadas no repositório.',
  },
];

export function FAQ() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-primary font-medium mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Dúvidas frequentes
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Perguntas <span className="text-primary">respondidas</span>
          </motion.h2>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground">
            Ainda tem dúvidas?{' '}
            <a
              href="#"
              className="text-primary hover:underline"
            >
              Fale com a equipe FND
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
