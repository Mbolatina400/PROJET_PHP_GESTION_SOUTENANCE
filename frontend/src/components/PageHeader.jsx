import { useEtablissement } from "./EtablissementContext";

function PageHeader({ title, description, instruction, actions }) {
  const { etablissement } = useEtablissement();
  return (
    <header className="page-header">
      <div>
        <p className="page-eyebrow">{etablissement?.sigle || etablissement?.nom || "Gestion des soutenances"}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {(actions || instruction) && <div className="page-header-side">
        {actions}
        {instruction && (
          <p className="page-instruction"><span aria-hidden="true">i</span>{instruction}</p>
        )}
      </div>}
    </header>
  );
}

export default PageHeader;
