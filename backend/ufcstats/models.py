from django.db import models

class UFCEvent(models.Model):
    event_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=255)
    date = models.DateField()
    location = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.date})"

class UFCFight(models.Model):
    event = models.ForeignKey(UFCEvent, on_delete=models.CASCADE, related_name='fights')
    bout = models.CharField(max_length=255)
    url = models.URLField(unique=True)

    outcome = models.CharField(max_length=50, blank=True)
    weightclass = models.CharField(max_length=50, blank=True)
    method = models.CharField(max_length=120, blank=True)
    round = models.PositiveSmallIntegerField(null=True,  blank=True)
    time = models.CharField(max_length=20, blank=True, null=True)
    time_format = models.CharField(max_length=20, blank=True)
    referee = models.CharField(max_length=60, blank=True)
    
    def __str__(self):
        return f"({self.event.name}) {self.bout}"
    
class UFCFightStats(models.Model):
        fight = models.ForeignKey(UFCFight, on_delete=models.CASCADE, related_name='stats')
        fighter_name = models.CharField(max_length=255)
        round = models.PositiveSmallIntegerField()
        
        kd = models.PositiveSmallIntegerField(blank=True, default=0)
        sig_str = models.CharField(max_length=30, blank=True)
        sig_str_pct = models.CharField(max_length=10, blank=True)
        total_str = models.CharField(max_length=30, blank=True)
        td = models.CharField(max_length=30, blank=True)
        td_pct = models.CharField(max_length=10, blank=True)
        sub_att = models.PositiveSmallIntegerField(blank=True, default=0)
        rev = models.PositiveSmallIntegerField(blank=True, default=0)
        ctrl = models.CharField(max_length=20, blank=True)
        
        head = models.CharField(max_length=30, blank=True)
        body = models.CharField(max_length=30, blank=True)
        leg = models.CharField(max_length=30, blank=True)
        distance = models.CharField(max_length=30, blank=True)
        clinch = models.CharField(max_length=30, blank=True)
        ground = models.CharField(max_length=30, blank=True)
        
        class Meta:
            indexes = [
                models.Index(fields=["fighter_name"]),
                models.Index(fields=["round"]),
        ]
        
        def __str__(self):
            return f"{self.fighter_name} - Round {self.round} ({self.fight.bout})"