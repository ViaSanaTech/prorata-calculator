
import { useState, useEffect } from "react";
import { format, endOfMonth, getDaysInMonth, isAfter, isSameDay, isBefore, getDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Jours de la semaine en français
const daysOfWeek = [
  { id: 1, label: "Lundi" },
  { id: 2, label: "Mardi" },
  { id: 3, label: "Mercredi" },
  { id: 4, label: "Jeudi" },
  { id: 5, label: "Vendredi" },
  { id: 6, label: "Samedi" },
  { id: 0, label: "Dimanche" },
];

const Index = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [stopDate, setStopDate] = useState<Date | undefined>(undefined);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 4]); // Par défaut: lundi, jeudi
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(50);
  const [exerciseDays, setExerciseDays] = useState<number>(0);
  const [proRatedCost, setProRatedCost] = useState<number>(0);
  const [daysInMonth, setDaysInMonth] = useState<number>(0);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  const toggleDay = (dayId: number) => {
    setSelectedDays((current) =>
      current.includes(dayId)
        ? current.filter((id) => id !== dayId)
        : [...current, dayId]
    );
  };

  const calculateExerciseDays = () => {
    if (!startDate || selectedDays.length === 0) return;

    // Déterminer la date de fin pour le calcul
    const endDate = stopDate || endOfMonth(startDate);
    const totalDaysInMonth = getDaysInMonth(startDate);
    let exerciseDaysCount = 0;

    // Copie de la date de départ pour itérer
    let currentDate = new Date(startDate);

    // Parcours de tous les jours du début jusqu'à la fin du mois ou la date d'arrêt
    while ((isBefore(currentDate, endDate) || isSameDay(currentDate, endDate))) {
      const dayOfWeek = getDay(currentDate); // 0 = dimanche, 1 = lundi, etc.
      
      // Si ce jour de la semaine est dans les jours sélectionnés
      if (selectedDays.includes(dayOfWeek)) {
        exerciseDaysCount++;
      }
      
      // Passage au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Mise à jour des états
    setExerciseDays(exerciseDaysCount);
    setDaysInMonth(totalDaysInMonth);
    setProRatedCost(parseFloat(((subscriptionPrice * exerciseDaysCount) / totalDaysInMonth).toFixed(2)));
    setIsCalculated(true);
  };

  // Recalculer si les paramètres changent
  useEffect(() => {
    if (isCalculated) {
      calculateExerciseDays();
    }
  }, [startDate, stopDate, selectedDays, subscriptionPrice]);

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">Calculateur de Coût d'Exercice</h1>
      <p className="text-gray-500 mb-8">Calculez le coût proratisé de votre abonnement d'exercice</p>

      <Card className="w-full max-w-xl p-6 shadow-md bg-white border-0 transition-all duration-300 hover:shadow-lg">
        <div className="space-y-6">
          {/* Date de démarrage */}
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-gray-700">Date de démarrage</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border border-gray-200 hover:bg-gray-50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionnez une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date d'arrêt */}
          <div className="space-y-2">
            <Label htmlFor="stop-date" className="text-gray-700">Date d'arrêt (optionnelle)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border border-gray-200 hover:bg-gray-50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {stopDate ? (
                    format(stopDate, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionnez une date (fin du mois par défaut)</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={stopDate}
                  onSelect={setStopDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Jours d'exercice */}
          <div className="space-y-2">
            <Label className="text-gray-700">Jours d'exercice hebdomadaires</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => toggleDay(day.id)}
                    className="border-gray-300"
                  />
                  <label
                    htmlFor={`day-${day.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Prix de l'abonnement */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-gray-700">Prix de l'abonnement mensuel (€)</Label>
            <Input
              id="price"
              type="number"
              value={subscriptionPrice}
              onChange={(e) => setSubscriptionPrice(parseFloat(e.target.value) || 0)}
              className="border border-gray-200"
              min="0"
              step="0.01"
            />
          </div>

          <Button
            onClick={calculateExerciseDays}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            Calculer
          </Button>
        </div>
      </Card>

      {isCalculated && (
        <Card className="w-full max-w-xl p-6 shadow-md mt-6 bg-white border-0 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Résultats</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Jours d'exercice ce mois-ci</p>
                <p className="text-2xl font-bold text-blue-600">{exerciseDays} jours</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Jours dans le mois</p>
                <p className="text-2xl font-bold text-gray-700">{daysInMonth} jours</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Prix TTC</p>
                <p className="text-2xl font-bold text-gray-700">{subscriptionPrice.toFixed(2)} €</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700">Prix proratisé HT</p>
                <p className="text-2xl font-bold text-blue-600">{proRatedCost.toFixed(2)} €</p>
              </div>
            </div>
            <div className="pt-2 text-center text-sm text-gray-500">
              <p>Formule: Prix × (Jours d'exercice ÷ Jours du mois)</p>
              <p className="mt-1 font-medium">{subscriptionPrice.toFixed(2)} € × ({exerciseDays} ÷ {daysInMonth}) = {proRatedCost.toFixed(2)} €</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Index;
