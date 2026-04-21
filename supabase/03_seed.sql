-- ============================================================
--  DR DELTA · Seed inicial
--  Pegar al final. Seed = primer admin + 12 variables + 3 campos demo.
-- ============================================================

-- Primer admin (se aplica al hacer magic-link login con este email)
insert into public.invitaciones (email, rol)
values ('ignacio@nextmove.cl', 'admin')
on conflict (email) do update set rol = excluded.rol;

-- Campos demo (para poder probar el flujo sin entrar al admin)
insert into public.campos (nombre) values
  ('Fundo Los Aromos'),
  ('Agrícola El Roble'),
  ('Lechería Santa Clara')
on conflict (nombre) do nothing;

-- ------------------------------------------------------------
--  Variables iniciales (las mismas del Excel de carga).
--  Se cargan con sus 3 textos por color.
-- ------------------------------------------------------------
do $$
declare
  v_id uuid;
begin
  -- helper: upsert variable + 3 textos
  -- Metabolismo Interno · BHB (invertida)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('metabolismo','BHB','mmol/L','invertida',1.4,1.2)
    on conflict (ambito,nombre) do update set
      unidad=excluded.unidad, direccion=excluded.direccion,
      corte_rojo=excluded.corte_rojo, corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Cetosis subclínica — metabolismo energético comprometido.','Ajustar dieta de transición y revisar energía de la ración.','LIPOAKTIV GLU / MET'),
    (v_id,'amarillo','Riesgo de cetosis — monitoreo cercano.','Seguimiento semanal y evaluación de consumo.','LIPOAKTIV GLU'),
    (v_id,'verde','Balance energético normal.','Mantener manejo actual.','—')
  on conflict (variable_id,color) do update set
    interpretacion=excluded.interpretacion, accion=excluded.accion, solucion_addvise=excluded.solucion_addvise;

  -- Metabolismo Interno · pH Orina (normal — óptimo medio, lo dejamos como normal por simpleza)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('metabolismo','pH Orina','pH','normal',5.8,6.5)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Exceso aniónico — preparto mal balanceado.','Ajustar balance mineral y sales.','ANIMATE'),
    (v_id,'amarillo','DCAD en ajuste — revisar sales.','Afinar aporte catiónico.','ANIMATE'),
    (v_id,'verde','Balance aniónico correcto.','Mantener plan mineral.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Metabolismo Interno · Almidón Fecal (invertida)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('metabolismo','Almidón Fecal','%','invertida',8,5)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Pérdida energética alta — digestión ineficiente.','Ajustar molienda y digestibilidad del almidón.','RUMISTAR'),
    (v_id,'amarillo','Pérdida moderada — afinar ración.','Revisar tamaño de partícula y procesamiento.','RUMISTAR'),
    (v_id,'verde','Aprovechamiento correcto.','Mantener molienda.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Metabolismo Interno · Calcio en sangre (normal)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('metabolismo','Calcio en sangre','mg/dL','normal',8,9.5)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Hipocalcemia subclínica.','Ajustar programa mineral y evaluar DCAD.','ADDCOMPLEX'),
    (v_id,'amarillo','Calcio bajo límite — riesgo.','Suplementación mineral estratégica.','ADDCOMPLEX'),
    (v_id,'verde','Niveles normales.','Mantener mineralización.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Conservación y Dieta · Temperatura del silo (invertida)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('conservacion','Temperatura del silo (ΔT)','°C','invertida',10,5)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Deterioro activo — pérdida de energía.','Revisar compactación y manejo de la cara del silo.','KOFASIL'),
    (v_id,'amarillo','Riesgo — iniciar ajustes.','Reducir exposición al aire.','KOFASIL'),
    (v_id,'verde','Silo estable.','Mantener protocolo.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Conservación y Dieta · MS In Situ (normal)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('conservacion','MS In Situ','%','normal',30,35)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Ración diluida — MS baja.','Ajustar inclusión de materias secas.','—'),
    (v_id,'amarillo','MS en límite — afinar ración.','Balancear TMR.','—'),
    (v_id,'verde','MS objetivo alcanzada.','Mantener fórmula.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Conservación y Dieta · Diferencia MS estimada vs real (invertida)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('conservacion','Diferencia MS est. vs real','%','invertida',7,3)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Error crítico — dieta descalibrada.','Recalcular ración con MS real.','BERGAFAT'),
    (v_id,'amarillo','Ajuste necesario — afinar cálculo.','Repetir MS In Situ y ajustar.','BERGAFAT'),
    (v_id,'verde','Precisión correcta.','Mantener protocolo.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Conservación y Dieta · Malla Penn % finos (invertida)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('conservacion','Malla Penn — % finos','%','invertida',20,10)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Exceso de finos — fermentación inestable.','Ajustar tamaño de partícula y mezcla.','RUMISTAR'),
    (v_id,'amarillo','Distribución no óptima.','Revisar procesamiento.','RUMISTAR'),
    (v_id,'verde','Distribución adecuada.','Mantener tamaño de corte.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Ambiente e Inmunidad · Amoníaco ternereras (invertida)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('ambiente','Amoníaco ternereras','ppm','invertida',20,10)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Ambiente crítico — riesgo respiratorio.','Mejorar ventilación y manejo de camas.','MISTRAL'),
    (v_id,'amarillo','Riesgo — ventilar y limpiar camas.','Aumentar recambio de aire.','MISTRAL'),
    (v_id,'verde','Ambiente adecuado.','Mantener manejo.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Ambiente e Inmunidad · Micotoxinas (invertida)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('ambiente','Micotoxinas (nivel)','ppb','invertida',100,50)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Presencia — riesgo sanitario inmediato.','Mitigar exposición en el alimento.','MTOX / FIX FUSION'),
    (v_id,'amarillo','Detección moderada — adsorber.','Revisar fuentes de contaminación.','MTOX'),
    (v_id,'verde','Sin presencia relevante.','Mantener control.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Suelo y Pradera · pH suelo (normal)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('suelo','pH suelo','pH','normal',5.5,6.0)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Suelo ácido — limita disponibilidad de nutrientes.','Encalar según análisis.','NEOCOMPOST'),
    (v_id,'amarillo','pH en el límite.','Plan de encalado progresivo.','NEOCOMPOST'),
    (v_id,'verde','pH adecuado.','Mantener plan de fertilización.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

  -- Suelo y Pradera · Índice de Clorofila (normal)
  insert into public.variables(ambito,nombre,unidad,direccion,corte_rojo,corte_verde)
    values('suelo','Índice de Clorofila','SPAD','normal',30,45)
    on conflict (ambito,nombre) do update set unidad=excluded.unidad,direccion=excluded.direccion,corte_rojo=excluded.corte_rojo,corte_verde=excluded.corte_verde
    returning id into v_id;
  insert into public.variable_textos(variable_id,color,interpretacion,accion,solucion_addvise) values
    (v_id,'rojo','Déficit crítico de nitrógeno.','Aplicar fertilización nitrogenada táctica.','NITROMAX / SMAX'),
    (v_id,'amarillo','Respuesta parcial — monitorear.','Ajustar dosis de N.','NITROMAX'),
    (v_id,'verde','Estado nutricional óptimo.','Mantener plan.','—')
  on conflict (variable_id,color) do update set interpretacion=excluded.interpretacion,accion=excluded.accion,solucion_addvise=excluded.solucion_addvise;

end $$;
