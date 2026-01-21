export const metadata = {
  title: "Términos y Condiciones | Campamento DESAFÍO 2026",
  description:
    "Términos y condiciones oficiales del Campamento DESAFÍO 2026",
};

export default function TerminosYCondicionesPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <section className="mx-auto max-w-4xl bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          TÉRMINOS Y CONDICIONES
        </h1>

        <p className="text-center text-gray-600 mb-8">
          <strong>Campamento DESAFÍO 2026</strong>
        </p>

        <p className="text-gray-700 mb-6">
          Al completar el formulario de inscripción virtual, el padre, madre o
          representante legal, así como el/la participante, declaran haber leído,
          comprendido y aceptado los presentes Términos y Condiciones:
        </p>

        <article className="space-y-6 text-gray-700 leading-relaxed">

          <section>
            <h2 className="font-semibold text-lg mb-1">1. Información General</h2>
            <p>
              El campamento DESAFÍO es una actividad recreativa, formativa y/o
              espiritual, que se llevará a cabo del <strong>22 al 26 de febrero del 2026</strong>,
              dirigida a jóvenes y adolescentes con edades entre <strong>14 a 30 años</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">2. Proceso de Inscripción</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                La inscripción se realiza exclusivamente de manera virtual mediante
                el formulario oficial o presencial en las oficinas de la iglesia
                comunidad cristiana Castillo del Rey Juliaca.
              </li>
              <li>
                La información proporcionada debe ser veraz, completa y actualizada.
              </li>
              <li>
                La organización se reserva el derecho de rechazar o anular una
                inscripción si se detecta información falsa o incompleta.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              3. Autorización del Representante Legal
            </h2>
            <p>Para los participantes menores de edad:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                La inscripción debe ser realizada y autorizada por el padre, madre
                o representante legal.
              </li>
              <li>
                El representante autoriza la participación del menor en todas las
                actividades programadas del campamento.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              4. Salud y Condiciones Médicas
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                El representante legal declara que el participante se encuentra en
                condiciones físicas y mentales aptas para participar.
              </li>
              <li>
                Cualquier condición médica, alergia, tratamiento o necesidad especial
                debe ser informada en el formulario de inscripción.
              </li>
              <li>
                El campamento no se responsabiliza por situaciones derivadas de
                información médica no declarada.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              5. Atención Médica de Emergencia
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                El representante autoriza a los organizadores a tomar las decisiones
                necesarias para la atención del participante.
              </li>
              <li>
                Los gastos médicos que se generen serán asumidos por el representante
                legal, salvo que se indique lo contrario.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">6. Normas de Conducta</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Los participantes deberán mantener una conducta respetuosa hacia
                compañeros, líderes y personal.
              </li>
              <li>
                No está permitido portar o consumir sustancias prohibidas, alcohol,
                cigarrillos o cualquier objeto peligroso.
              </li>
              <li>
                El incumplimiento grave de las normas podrá resultar en la expulsión
                del campamento, sin derecho a reembolso.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              7. Uso de Imágenes y Material Audiovisual
            </h2>
            <p>
              El representante legal autoriza el uso de fotografías, videos y
              grabaciones del participante para fines promocionales, educativos o
              informativos del campamento.
            </p>
            <p className="mt-1">
              Dicho material podrá ser difundido en redes sociales, sitios web o
              material institucional.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              8. Pagos, Cancelaciones y Reembolsos
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                El costo del campamento, formas de pago y fechas límite serán
                informados previamente.
              </li>
              <li>
                En caso de cancelación por parte del participante, si se cancela antes
                del <strong>31 de enero</strong> se devolverá el <strong>50%</strong> del monto pagado.
                Luego de esta fecha no habrá reembolso.
              </li>
              <li>
                Si el campamento es cancelado por la organización, se informará el
                procedimiento correspondiente.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">9. Responsabilidad</h2>
            <p>
              La organización se compromete a velar por la seguridad y bienestar de
              los participantes durante las actividades.
            </p>
            <p className="mt-1">
              No se hace responsable por pérdidas de objetos personales.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">
              10. Aceptación de los Términos
            </h2>
            <p>
              Al enviar el formulario de inscripción virtual, el representante legal
              y el participante aceptan plenamente estos Términos y Condiciones.
            </p>
          </section>

        </article>
      </section>
    </main>
  );
}