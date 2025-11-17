import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuth()

  // Mock data - replace with real data from API
  const stats = [
    {
      title: 'Pacientes',
      value: '24',
      description: 'Total de pacientes cadastrados',
      icon: Users,
      trend: '+2 este mês',
    },
    {
      title: 'Atendimentos',
      value: '48',
      description: 'Atendimentos este mês',
      icon: Calendar,
      trend: '+12% vs mês anterior',
    },
    {
      title: 'Receita',
      value: 'R$ 3.240,00',
      description: 'Faturamento este mês',
      icon: DollarSign,
      trend: '+8% vs mês anterior',
    },
    {
      title: 'Crescimento',
      value: '18%',
      description: 'Taxa de crescimento',
      icon: TrendingUp,
      trend: 'Últimos 3 meses',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user?.name}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Atendimentos</CardTitle>
            <CardDescription>
              Suas consultas agendadas para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Maria Silva</p>
                  <p className="text-sm text-muted-foreground">Fisioterapia</p>
                </div>
                <span className="text-sm font-medium">09:00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">João Santos</p>
                  <p className="text-sm text-muted-foreground">Consulta</p>
                </div>
                <span className="text-sm font-medium">14:30</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Ana Costa</p>
                  <p className="text-sm text-muted-foreground">Retorno</p>
                </div>
                <span className="text-sm font-medium">16:00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm">Novo paciente cadastrado</p>
                  <p className="text-xs text-muted-foreground">2 horas atrás</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm">Pagamento recebido</p>
                  <p className="text-xs text-muted-foreground">4 horas atrás</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm">Consulta reagendada</p>
                  <p className="text-xs text-muted-foreground">1 dia atrás</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}